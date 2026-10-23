import { NextRequest, type NextFetchEvent } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Outer boundary only: the service-role client that proxy.ts builds for ring reads and record_ring_hop.
const ring = vi.hoisted(() => ({
    rows: [] as Array<Record<string, unknown>>,
    selectError: null as { message: string } | null,
    rpc: vi.fn(async () => ({ error: null as { message: string } | null })),
}));

vi.mock("@supabase/supabase-js", () => ({
    createClient: () => ({
        from: () => ({
            select: () => ({
                order: () => ({
                    returns: async () => ({
                        data: [...ring.rows].sort((a, b) => (a.ring_id as number) - (b.ring_id as number)),
                        error: ring.selectError,
                    }),
                }),
            }),
        }),
        rpc: ring.rpc,
    }),
}));

const HUMAN_UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

function member(ringId: number, domain: string | null) {
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

const ALICE = "https://alice.example.ca";
const BOB = "https://bob.example.ca";
const CAROL = "https://carol.example.ca";

function setRing(rows: Array<Record<string, unknown>>): void {
    ring.rows = rows;
}

/** Each test gets a fresh module so proxy.ts's one-minute in-memory ring cache starts empty. */
async function visit(
    search: string,
    options: { ua?: string; headers?: Record<string, string> } = {}
): Promise<{ status: number; location: string | null; waits: Promise<unknown>[] }> {
    const { proxy } = await import("@/proxy");
    const headers = new Headers({ "user-agent": HUMAN_UA, ...options.headers });
    if (options.ua !== undefined) headers.set("user-agent", options.ua);
    const request = new NextRequest(`https://uoftwebring.com/redirect${search}`, { headers });

    const waits: Promise<unknown>[] = [];
    const event = {
        waitUntil: (promise: Promise<unknown>) => void waits.push(promise),
    } as unknown as NextFetchEvent;
    const response = await proxy(request, event);
    return { status: response.status, location: response.headers.get("location"), waits };
}

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    ring.rpc.mockImplementation(async () => ({ error: null }));
    ring.selectError = null;
    setRing([member(1, ALICE), member(2, BOB), member(3, CAROL)]);
});

describe("/redirect neighbour resolution", () => {
    it("nav=next sends the visitor to the next member by ring id", async () => {
        expect((await visit("?nav=next&id=1")).location).toBe(`${BOB}/`);
    });

    it("nav=prev sends the visitor to the previous member", async () => {
        expect((await visit("?nav=prev&id=2")).location).toBe(`${ALICE}/`);
    });

    it("wraps forward from the last member to the first", async () => {
        expect((await visit("?nav=next&id=3")).location).toBe(`${ALICE}/`);
    });

    it("wraps backward from the first member to the last", async () => {
        expect((await visit("?nav=prev&id=1")).location).toBe(`${CAROL}/`);
    });

    it("uses the footer id 0 as a starting point outside the ring", async () => {
        expect((await visit("?nav=next&id=0")).location).toBe(`${ALICE}/`);
        expect((await visit("?nav=prev&id=0")).location).toBe(`${CAROL}/`);
    });

    it("resolves an unknown but numeric id to a neighbouring member", async () => {
        expect((await visit("?nav=next&id=99")).location).toBe(`${ALICE}/`);
        expect((await visit("?nav=prev&id=99")).location).toBe(`${CAROL}/`);
    });

    it.each([
        ["missing id", "?nav=next"],
        ["garbage id", "?nav=next&id=abc"],
        ["empty id", "?nav=next&id="],
        ["missing nav", "?id=1"],
        ["garbage nav", "?nav=sideways&id=1"],
    ])("does not fail with a 500 for %s", async (_label, search) => {
        const { status, location } = await visit(search);
        expect(status).toBeLessThan(400);
        expect(location).toMatch(/^https:\/\//);
    });

    // /redirect always resolves to a valid member, even from a broken widget link
    it.each(["?nav=next&id=abc", "?nav=sideways&id=1", "?id=1", "?nav=NEXT&id=1"])(
        "resolves %s to a member rather than the home page",
        async (search) => {
            const { location } = await visit(search);
            expect([ALICE, BOB, CAROL]).toContain(location?.replace(/\/$/, ""));
        }
    );
});

describe("/redirect destination filtering", () => {
    it("skips members whose domain is not a valid http(s) URL", async () => {
        setRing([
            member(1, ALICE),
            member(2, ""),
            member(3, "javascript:alert(1)"),
            member(4, "not a url"),
            member(5, "ftp://old.example.ca"),
            member(6, null),
            member(7, BOB),
        ]);
        expect((await visit("?nav=next&id=1")).location).toBe(`${BOB}/`);
        expect((await visit("?nav=prev&id=7")).location).toBe(`${ALICE}/`);
    });

    it("falls back to the home page when no member has a usable domain", async () => {
        setRing([member(1, ""), member(2, "javascript:void(0)")]);
        const { status, location } = await visit("?nav=next&id=1");
        expect(status).toBeLessThan(400);
        expect(location).toMatch(/^https?:\/\/[^/]+\/$/);
        expect(location).not.toContain("javascript");
    });
});

describe("/redirect visit recording", () => {
    it("records a human hop from a member to the destination via waitUntil", async () => {
        const { waits } = await visit("?nav=next&id=1");
        expect(waits).toHaveLength(1);
        await Promise.all(waits);
        expect(ring.rpc).toHaveBeenCalledWith("record_ring_hop", { from_ring_id: 1, to_ring_id: 2 });
    });

    it("records a made-up source id as a null origin so it can't create stats rows", async () => {
        const { waits } = await visit("?nav=next&id=99");
        await Promise.all(waits);
        expect(ring.rpc).toHaveBeenCalledWith("record_ring_hop", { from_ring_id: null, to_ring_id: 1 });
    });

    it.each([
        ["Googlebot", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"],
        ["curl", "curl/8.4.0"],
        ["link preview", "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)"],
        ["headless browser", "Mozilla/5.0 HeadlessChrome/120.0"],
        ["empty user agent", ""],
    ])("still redirects but does not count %s", async (_label, ua) => {
        const { location, waits } = await visit("?nav=next&id=1", { ua });
        expect(location).toBe(`${BOB}/`);
        expect(waits).toHaveLength(0);
        expect(ring.rpc).not.toHaveBeenCalled();
    });

    it.each([
        ["Sec-Purpose: prefetch", { "sec-purpose": "prefetch" }],
        ["Purpose: prefetch", { purpose: "prefetch" }],
        ["Sec-Purpose: prerender", { "sec-purpose": "prefetch;prerender" }],
    ])("does not count browser prefetch requests (%s)", async (_label, headers) => {
        const { location, waits } = await visit("?nav=next&id=1", { headers });
        expect(location).toBe(`${BOB}/`);
        expect(waits).toHaveLength(0);
    });

    it("does not wait for the recording before answering the redirect", async () => {
        ring.rpc.mockReturnValueOnce(new Promise(() => {}));
        const { location, waits } = await visit("?nav=next&id=1");
        expect(location).toBe(`${BOB}/`);
        expect(waits).toHaveLength(1);
    });

    it("keeps redirecting when record_ring_hop returns an error", async () => {
        ring.rpc.mockResolvedValueOnce({ error: { message: "relation ring_visit_daily does not exist" } });
        const { location, waits } = await visit("?nav=next&id=1");
        expect(location).toBe(`${BOB}/`);
        await expect(Promise.allSettled(waits)).resolves.toEqual([
            expect.objectContaining({ status: "fulfilled" }),
        ]);
    });

    it("keeps redirecting when record_ring_hop rejects", async () => {
        ring.rpc.mockRejectedValueOnce(new Error("socket hang up"));
        const { status, location, waits } = await visit("?nav=prev&id=2");
        expect(status).toBe(307);
        expect(location).toBe(`${ALICE}/`);
        const [outcome] = await Promise.allSettled(waits);
        expect(outcome.status).toBe("rejected");
    });
});
