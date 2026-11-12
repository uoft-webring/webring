import { describe, it, expect } from "vitest";
import { cn } from "@/lib/cn";
import { previewVersion } from "@/lib/site";
import { uoftIndexUrl } from "@/lib/uoftindex";

describe("cn", () => {
    it("merges class names", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
        expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("deduplicates tailwind classes", () => {
        expect(cn("p-4", "p-2")).toBe("p-2");
    });

    it("handles empty inputs", () => {
        expect(cn()).toBe("");
    });

    it("handles undefined and null", () => {
        expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });
});

describe("previewVersion", () => {
    it("is stable for a domain and changes when the domain does", () => {
        expect(previewVersion("https://jane.dev")).toBe(previewVersion("https://jane.dev"));
        expect(previewVersion("https://jane.dev")).not.toBe(previewVersion("https://jane.dev/"));
        expect(previewVersion("https://jane.dev")).toMatch(/^[0-9a-z]+$/);
    });
});

describe("uoftIndexUrl", () => {
    it("tags each placement separately under one campaign", () => {
        const url = new URL(uoftIndexUrl("navbar"));
        expect(url.origin).toBe("https://uoftindex.com");
        expect(url.searchParams.get("utm_source")).toBe("uoftwebring");
        expect(url.searchParams.get("utm_medium")).toBe("navbar");
        expect(url.searchParams.get("utm_campaign")).toBe("cross_promo");
    });

    it("keeps the banner link the promo always used", () => {
        expect(uoftIndexUrl("banner")).toBe(
            "https://uoftindex.com/?utm_source=uoftwebring&utm_medium=banner&utm_campaign=cross_promo"
        );
    });
});
