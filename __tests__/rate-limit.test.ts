import { describe, expect, it, vi } from "vitest";

// The module talks to Supabase only inside consumeRateLimit; these tests cover the pure parts
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createAdminClient: vi.fn() }));

const { AUTH_LIMITS, bucketKey, clientIpFrom } = await import("@/lib/rate-limit");

describe("bucketKey", () => {
    it("never stores the raw subject", () => {
        const key = bucketKey(AUTH_LIMITS.otpSendPerEmail, "someone@mail.utoronto.ca");
        expect(key).not.toContain("someone");
        expect(key).toMatch(/^otp-send:email:[0-9a-f]{64}$/);
    });

    it("treats case and surrounding spaces as the same email", () => {
        expect(bucketKey(AUTH_LIMITS.otpSendPerEmail, " Someone@Utoronto.ca ")).toBe(
            bucketKey(AUTH_LIMITS.otpSendPerEmail, "someone@utoronto.ca")
        );
    });

    it("keeps limits apart for the same subject", () => {
        expect(bucketKey(AUTH_LIMITS.otpSendPerEmail, "a@utoronto.ca")).not.toBe(
            bucketKey(AUTH_LIMITS.otpVerifyPerEmail, "a@utoronto.ca")
        );
    });
});

describe("clientIpFrom", () => {
    it("takes the first hop", () => {
        expect(clientIpFrom("203.0.113.7, 10.0.0.1")).toBe("203.0.113.7");
    });

    it("returns null when there is no address", () => {
        expect(clientIpFrom(null)).toBeNull();
        expect(clientIpFrom("")).toBeNull();
        expect(clientIpFrom(" , 10.0.0.1")).toBeNull();
    });
});
