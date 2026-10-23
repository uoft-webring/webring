import { describe, expect, it, vi } from "vitest";

let rebindCalls = 0;

vi.mock("node:dns/promises", () => ({
    lookup: vi.fn(async (host: string) => {
        const table: Record<string, string[]> = {
            "public.example": ["93.184.216.34"],
            "rebind.example": ["93.184.216.34", "10.0.0.5"],
            "metadata.example": ["169.254.169.254"],
            // Public for the validation lookup, loopback for the connection lookup
            "flip.example": [rebindCalls++ === 0 ? "93.184.216.34" : "127.0.0.1"],
        };
        if (!table[host]) throw new Error("ENOTFOUND");
        return table[host].map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));
    }),
}));

import { isPublicAddress, resolvePublicUrl, safeFetch } from "@/lib/url-safety";

describe("isPublicAddress", () => {
    it.each(["93.184.216.34", "1.1.1.1", "2606:4700:4700::1111"])("allows %s", (address) =>
        expect(isPublicAddress(address)).toBe(true)
    );

    it.each([
        "127.0.0.1",
        "127.0.0.2",
        "10.1.2.3",
        "172.16.0.1",
        "192.168.1.1",
        "169.254.169.254",
        "100.64.0.1",
        "0.0.0.0",
        "::1",
        "::",
        "fd00::1",
        "fe80::1",
        "::ffff:127.0.0.1",
        "::ffff:7f00:1",
        // IPv4-compatible and 6to4 forms embed 127.0.0.1
        "::7f00:1",
        "2002:7f00:1::1",
        "not-an-ip",
    ])("blocks %s", (address) => expect(isPublicAddress(address)).toBe(false));
});

describe("resolvePublicUrl", () => {
    it("accepts public http(s) URLs", async () => {
        expect(await resolvePublicUrl("https://public.example/page")).not.toBeNull();
        expect(await resolvePublicUrl("http://93.184.216.34")).not.toBeNull();
    });

    it.each([
        "ftp://public.example",
        "javascript:alert(1)",
        "file:///etc/passwd",
        "http://[::1]/",
        "http://127.0.0.1:3000",
        "http://user:pass@public.example",
        "https://metadata.example",
        "https://unknown.example",
        "not a url",
    ])("rejects %s", async (url) => expect(await resolvePublicUrl(url)).toBeNull());

    it("rejects hosts where any resolved address is private", async () => {
        expect(await resolvePublicUrl("https://rebind.example")).toBeNull();
    });
});

describe("safeFetch", () => {
    it("refuses to connect when the hostname re-resolves to a private address (DNS rebinding)", async () => {
        rebindCalls = 0;
        expect(await safeFetch("http://flip.example/")).toBeNull();
        // Validation passed on the first lookup; the connection-time lookup is what blocked it
        expect(rebindCalls).toBe(2);
    });

    it("never fetches private URLs", async () => {
        expect(await safeFetch("http://127.0.0.1:1/")).toBeNull();
    });
});
