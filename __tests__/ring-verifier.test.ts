import { describe, expect, it, vi } from "vitest";
import { isOwnSiteReferral } from "@/lib/profiles/ring";
import { statusAfterCheck, statusAfterRecheck } from "@/lib/ring-link";

vi.mock("@/lib/env", () => ({ serverEnv: () => ({ DOMAIN_VALIDATION_SECRET_KEY: "test", ADMIN_EMAILS: " Owner@mail.utoronto.ca, second@utoronto.ca" }) }));
vi.mock("@/lib/auth", () => ({ getOwnProfile: vi.fn() }));

const { analyzeRingWidget } = await import("@/lib/verification");
const { isAdminEmail } = await import("@/lib/admin");

const link = (nav: string, id: number) => `<a href="https://uoftwebring.com/redirect?nav=${nav}&amp;id=${id}">x</a>`;

describe("analyzeRingWidget", () => {
    it("tells the member exactly what's wrong", () => {
        expect(analyzeRingWidget(link("prev", 7) + link("next", 7), 7)).toBe("found");
        expect(analyzeRingWidget(link("next", 7), 7)).toBe("partial");
        expect(analyzeRingWidget(link("prev", 3) + link("next", 3), 7)).toBe("wrong_id");
        expect(analyzeRingWidget("<html><body><p>Hi</p></body></html>", 7)).toBe("missing");
    });

    it("recognises client-rendered app shells", () => {
        expect(analyzeRingWidget('<body><div id="root"></div><script src="/main.js"></script></body>', 7)).toBe("js_rendered");
        expect(analyzeRingWidget('<div id="__next" class="x">  </div>', 7)).toBe("js_rendered");
        expect(analyzeRingWidget("<noscript>You need to enable JavaScript to run this app.</noscript>", 7)).toBe("js_rendered");
    });

    it("accepts relative links only on the ring's own site", () => {
        const relative = '<a href="/redirect?nav=prev&amp;id=0">‹</a><a href="/redirect?nav=next&amp;id=0">›</a>';
        expect(analyzeRingWidget(relative, 0, true)).toBe("found");
        expect(analyzeRingWidget(relative, 0)).toBe("missing");
    });

    it("prefers the links over the shell when both are present", () => {
        expect(analyzeRingWidget('<div id="root"></div>' + link("prev", 7) + link("next", 7), 7)).toBe("found");
    });
});

describe("isOwnSiteReferral", () => {
    const browser = { fetchMode: "navigate", fetchSite: "cross-site" };

    it("accepts a browser navigation from the member's own site, www or not", () => {
        expect(isOwnSiteReferral({ ...browser, referer: "https://www.jane.dev/about" }, "https://jane.dev")).toBe(true);
    });

    it("rejects other sites, missing headers and non-navigation requests", () => {
        expect(isOwnSiteReferral({ ...browser, referer: "https://evil.dev/" }, "https://jane.dev")).toBe(false);
        expect(isOwnSiteReferral({ ...browser, referer: null }, "https://jane.dev")).toBe(false);
        expect(isOwnSiteReferral({ referer: "https://jane.dev/", fetchMode: "cors", fetchSite: "cross-site" }, "https://jane.dev")).toBe(false);
        expect(isOwnSiteReferral({ referer: "https://jane.dev/", fetchMode: null, fetchSite: null }, "https://jane.dev")).toBe(false);
        expect(isOwnSiteReferral({ ...browser, referer: "not a url" }, "https://jane.dev")).toBe(false);
    });
});

describe("statusAfterCheck", () => {
    it("connects on found, queues JS sites for review, and leaves outages alone", () => {
        expect(statusAfterCheck("found", "disconnected")).toBe("connected");
        expect(statusAfterCheck("js_rendered", "disconnected")).toBe("pending");
        expect(statusAfterCheck("unreachable", "pending")).toBe("pending");
        expect(statusAfterCheck("missing", "pending")).toBe("disconnected");
    });
});

describe("statusAfterRecheck", () => {
    const now = new Date("2026-10-23T12:00:00Z");
    const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000);

    it("needs two failures in a row before moving a connected site to review", () => {
        expect(statusAfterRecheck("connected", "missing", 1, null, now)).toBe("connected");
        expect(statusAfterRecheck("connected", "missing", 2, null, now)).toBe("pending");
    });

    it("trusts recent clicks over the HTML check (JavaScript sites)", () => {
        expect(statusAfterRecheck("connected", "missing", 5, daysAgo(3), now)).toBe("connected");
        expect(statusAfterRecheck("connected", "missing", 5, daysAgo(45), now)).toBe("pending");
    });

    it("reconnects a site that's fixed, and never touches disconnected ones otherwise", () => {
        expect(statusAfterRecheck("pending", "found", 0, null, now)).toBe("connected");
        expect(statusAfterRecheck("disconnected", "missing", 9, null, now)).toBe("disconnected");
    });
});

describe("isAdminEmail", () => {
    it("matches the configured list, ignoring case and spaces", () => {
        expect(isAdminEmail("owner@mail.utoronto.ca")).toBe(true);
        expect(isAdminEmail("SECOND@utoronto.ca")).toBe(true);
        expect(isAdminEmail("someone@utoronto.ca")).toBe(false);
        expect(isAdminEmail("")).toBe(false);
    });
});
