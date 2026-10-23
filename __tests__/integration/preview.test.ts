import { EventEmitter } from "node:events";
import { NextRequest } from "next/server";
import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/preview/[ringId]/route";
import { previewVersion } from "@/lib/site";

// Network and DNS are the outer boundary: safeFetch and its public-address checks run for real.
const net = vi.hoisted(() => ({
    lookup: vi.fn(),
    request: vi.fn(),
}));

vi.mock("node:dns/promises", async (importOriginal) => ({
    ...(await importOriginal<typeof import("node:dns/promises")>()),
    lookup: net.lookup,
}));

vi.mock("node:https", async (importOriginal) => ({
    ...(await importOriginal<typeof import("node:https")>()),
    request: net.request,
}));

const db = vi.hoisted(() => ({
    rows: [] as Array<Record<string, unknown>>,
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
    unstable_cache: <T>(fn: T): T => fn,
}));

vi.mock("@/lib/supabase/server", () => ({
    createAdminClient: () => ({
        from: () => ({
            select: () => ({
                order: () => ({
                    returns: async () => ({ data: db.rows, error: null }),
                }),
            }),
        }),
    }),
}));

const PUBLIC_IP = { address: "93.184.216.34", family: 4 };
const MEMBER = "https://member.example.ca";
const CARD = "https://cdn.member.example.ca/card.png";

type Site = { status: number; contentType: string; body: Buffer };
let sites: Record<string, Site>;
let served: string[];

function memberRow(ringId: number, domain: string): Record<string, unknown> {
    return {
        ring_id: ringId,
        slug: `member-${ringId}`,
        name: `Member ${ringId}`,
        tagline: null,
        domain,
        github_url: null,
        image_key: null,
        is_verified: true,
        validated_user_component: "connected",
        tags: [],
        graduation_year: null,
        program: null,
        open_to_work: false,
    };
}

/**
 * Minimal stand-in for node:https.request. It runs the lookup option the way the socket layer does,
 * so a DNS answer that changes between checks is exercised too.
 */
function fakeRequest(
    url: URL,
    options: { lookup?: unknown },
    callback: (response: unknown) => void
): EventEmitter {
    const req = new EventEmitter() as EventEmitter & { end: () => void };
    req.end = () => {
        const lookup = options.lookup as (
            host: string,
            opts: { all: boolean },
            cb: (error: Error | null) => void
        ) => void;
        lookup(url.hostname, { all: true }, (error) => {
            if (error) {
                req.emit("error", error);
                return;
            }
            const site = sites[url.toString()];
            if (!site) {
                req.emit("error", new Error(`no fake site for ${url}`));
                return;
            }
            served.push(url.toString());
            const response = new EventEmitter() as EventEmitter & Record<string, unknown>;
            response.statusCode = site.status;
            response.headers = { "content-type": site.contentType };
            response.destroy = () => undefined;
            callback(response);
            setImmediate(() => {
                response.emit("data", site.body);
                response.emit("end");
            });
        });
    };
    return req;
}

async function preview(ringId: string, search: string | null = null): Promise<Response> {
    const query = search === null ? "" : `?${search}`;
    const request = new NextRequest(`https://uoftwebring.com/api/preview/${ringId}${query}`);
    return GET(request, { params: Promise.resolve({ ringId }) });
}

function versioned(ringId: number, domain: string): Promise<Response> {
    return preview(String(ringId), `v=${previewVersion(domain)}`);
}

function requestedHosts(): string[] {
    return net.request.mock.calls.map(([url]) => (url as URL).hostname);
}

function assertNoFetch(): void {
    expect(net.request).not.toHaveBeenCalled();
}

beforeEach(async () => {
    vi.clearAllMocks();
    net.lookup.mockReset();
    net.lookup.mockImplementation(async () => [PUBLIC_IP]);
    net.request.mockReset();
    net.request.mockImplementation(fakeRequest);
    served = [];
    const card = await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#1a50a0" } })
        .png()
        .toBuffer();
    sites = {
        [`${MEMBER}/`]: {
            status: 200,
            contentType: "text/html; charset=utf-8",
            body: Buffer.from(`<html><head><meta property="og:image" content="${CARD}"></head></html>`),
        },
        [CARD]: { status: 200, contentType: "image/png", body: card },
    };
    db.rows = [memberRow(7, MEMBER)];
});

describe("GET /api/preview/[ringId] lookup", () => {
    it("404s for a ring id that is not a member", async () => {
        const response = await versioned(999, MEMBER);
        expect(response.status).toBe(404);
        assertNoFetch();
    });

    it.each(["abc", "-1", "01", "1.5", "99999999999"])(
        "404s for a malformed ring id %s without reading ring data",
        async (ringId) => {
            const response = await preview(ringId, "v=abc");
            expect(response.status).toBe(404);
            assertNoFetch();
        }
    );

    it.each([
        ["no query", null],
        ["missing version", "other=1"],
        ["extra parameter", `v=${previewVersion(MEMBER)}&cb=1`],
        ["stale version", "v=deadbeef"],
    ])("404s when the request is not the canonical URL (%s)", async (_label, search) => {
        const response = await preview("7", search);
        expect(response.status).toBe(404);
        assertNoFetch();
    });

    it("never fetches a ring entry whose domain is not a valid http(s) URL", async () => {
        for (const domain of ["javascript:alert(1)", "", "file:///etc/passwd"]) {
            db.rows = [memberRow(8, domain)];
            const response = await versioned(8, domain);
            expect(response.status).toBe(404);
        }
        assertNoFetch();
        expect(net.lookup).not.toHaveBeenCalled();
    });
});

describe("GET /api/preview/[ringId] outbound fetches", () => {
    it.each([
        ["loopback", "127.0.0.1"],
        ["private 10.x", "10.0.0.5"],
        ["private 192.168.x", "192.168.1.10"],
        ["cloud metadata", "169.254.169.254"],
        ["IPv6 loopback", "::1"],
        ["IPv4-mapped loopback", "::ffff:127.0.0.1"],
    ])("refuses a member whose domain resolves to %s", async (_label, address) => {
        net.lookup.mockResolvedValue([{ address, family: address.includes(":") ? 6 : 4 }]);
        const response = await versioned(7, MEMBER);
        expect(response.status).toBe(404);
        assertNoFetch();
    });

    it("refuses a domain that resolves to both a public and a private address", async () => {
        net.lookup.mockResolvedValue([PUBLIC_IP, { address: "10.1.2.3", family: 4 }]);
        expect((await versioned(7, MEMBER)).status).toBe(404);
        assertNoFetch();
    });

    // DNS rebinding: the first answer passes the up-front check, the second (at connect time) is private.
    it("refuses when DNS flips to a private address between the check and the connection", async () => {
        net.lookup
            .mockResolvedValueOnce([PUBLIC_IP])
            .mockResolvedValueOnce([{ address: "127.0.0.1", family: 4 }]);
        const response = await versioned(7, MEMBER);
        expect(response.status).toBe(404);
        expect(served).toEqual([]);
    });

    it("renders a public member's declared preview image as WebP", async () => {
        const response = await versioned(7, MEMBER);

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("image/webp");
        expect(response.headers.get("x-content-type-options")).toBe("nosniff");
        expect(response.headers.get("cache-control")).toContain("s-maxage=86400");
        const bytes = Buffer.from(await response.arrayBuffer());
        expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
        expect(bytes.subarray(8, 12).toString("ascii")).toBe("WEBP");
        expect(requestedHosts()).toEqual(["member.example.ca", "cdn.member.example.ca"]);
    });

    it("404s when the member's page declares no preview image", async () => {
        sites[`${MEMBER}/`] = { status: 200, contentType: "text/html", body: Buffer.from("<html></html>") };
        expect((await versioned(7, MEMBER)).status).toBe(404);
    });

    it("404s when the declared preview is served as something other than an image", async () => {
        sites[CARD] = {
            status: 200,
            contentType: "text/html",
            body: Buffer.from("<script>alert(1)</script>"),
        };
        expect((await versioned(7, MEMBER)).status).toBe(404);
    });
});
