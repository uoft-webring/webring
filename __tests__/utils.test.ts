import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

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
