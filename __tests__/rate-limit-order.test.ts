import { beforeEach, describe, expect, it, vi } from "vitest";

// Buckets that are already full; every rpc call is recorded so we can see which budgets were spent
const full = new Set<string>();
const spent: string[] = [];
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "203.0.113.9" }) }));
vi.mock("@/lib/supabase/server", () => ({
    createAdminClient: () => ({
        rpc: async (_name: string, args: { bucket: string }) => {
            spent.push(args.bucket.split(":").slice(0, 2).join(":"));
            return { data: !full.has(args.bucket.split(":").slice(0, 2).join(":")), error: null };
        },
    }),
}));

const { allowOtpSend, allowOtpVerify } = await import("@/lib/rate-limit");

beforeEach(() => {
    full.clear();
    spent.length = 0;
});

describe("allowOtpSend", () => {
    it("allows when both budgets have room", async () => {
        expect(await allowOtpSend("a@utoronto.ca")).toBe("ok");
        expect(spent).toEqual(["otp-send:ip", "otp-send:email"]);
    });

    it("never spends someone's inbox budget once the client is blocked", async () => {
        full.add("otp-send:ip");
        expect(await allowOtpSend("victim@utoronto.ca")).toBe("client");
        expect(spent).toEqual(["otp-send:ip"]);
    });

    it("reports a full inbox separately", async () => {
        full.add("otp-send:email");
        expect(await allowOtpSend("a@utoronto.ca")).toBe("inbox");
    });
});

describe("allowOtpVerify", () => {
    it("stops at the first full budget", async () => {
        full.add("otp-verify:ip");
        expect(await allowOtpVerify("a@utoronto.ca")).toBe(false);
        expect(spent).toEqual(["otp-verify:ip"]);
    });

    it("applies the site-wide ceiling last", async () => {
        full.add("otp-verify:all");
        expect(await allowOtpVerify("a@utoronto.ca")).toBe(false);
        expect(spent).toEqual(["otp-verify:ip", "otp-verify:email", "otp-verify:all"]);
    });
});
