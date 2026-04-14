import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
    createAdminClient: vi.fn(),
    createClient: vi.fn(),
}));

import { validateUrl } from "@/utils/zod-fetcher";

describe("validateUrl", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("rejects non-http protocols", async () => {
        expect(await validateUrl("ftp://example.com")).toBe(false);
        expect(await validateUrl("file:///etc/passwd")).toBe(false);
        expect(await validateUrl("javascript:alert(1)")).toBe(false);
    });

    it("blocks localhost", async () => {
        expect(await validateUrl("http://localhost")).toBe(false);
        expect(await validateUrl("http://localhost:3000")).toBe(false);
    });

    it("blocks 127.0.0.1", async () => {
        expect(await validateUrl("http://127.0.0.1")).toBe(false);
    });

    it("blocks 0.0.0.0", async () => {
        expect(await validateUrl("http://0.0.0.0")).toBe(false);
    });

    it("blocks AWS metadata endpoint", async () => {
        expect(await validateUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    });

    it("blocks IPv6 loopback", async () => {
        expect(await validateUrl("http://[::1]")).toBe(false);
    });

    it("blocks private 10.x IPs", async () => {
        expect(await validateUrl("http://10.0.0.1")).toBe(false);
    });

    it("blocks private 172.16-31.x IPs", async () => {
        expect(await validateUrl("http://172.16.0.1")).toBe(false);
        expect(await validateUrl("http://172.31.255.255")).toBe(false);
    });

    it("blocks private 192.168.x IPs", async () => {
        expect(await validateUrl("http://192.168.1.1")).toBe(false);
    });

    it("blocks .internal domains", async () => {
        expect(await validateUrl("http://metadata.google.internal")).toBe(false);
        expect(await validateUrl("http://something.internal")).toBe(false);
    });

    it("blocks .local domains", async () => {
        expect(await validateUrl("http://myprinter.local")).toBe(false);
    });

    it("rejects completely invalid URLs", async () => {
        expect(await validateUrl("not a url")).toBe(false);
    });

    it("accepts valid public URLs when fetch succeeds", async () => {
        const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
        vi.stubGlobal("fetch", mockFetch);

        const result = await validateUrl("https://example.com");
        expect(result).toBe(true);
        expect(mockFetch).toHaveBeenCalledOnce();
    });

    it("accepts 3xx redirects", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 301 }));
        expect(await validateUrl("https://example.com")).toBe(true);
    });

    it("rejects 4xx responses", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 404 }));
        expect(await validateUrl("https://example.com")).toBe(false);
    });

    it("rejects 5xx responses", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 500 }));
        expect(await validateUrl("https://example.com")).toBe(false);
    });

    it("returns false on network errors", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
        expect(await validateUrl("https://example.com")).toBe(false);
    });
});
