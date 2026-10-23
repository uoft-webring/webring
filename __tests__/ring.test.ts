import { describe, expect, it } from "vitest";
import { findRingDestination, ringMembers } from "@/lib/profiles/ring";
import type { PublicProfile } from "@/lib/profiles/types";

function member(ringId: number, domain = `https://site${ringId}.dev`): PublicProfile {
    return {
        ringId,
        domain,
        slug: `m${ringId}`,
        name: `Member ${ringId}`,
        tagline: "",
        githubUsername: "",
        imageKey: "",
        isVerified: false,
        ringStatus: "connected",
        tags: [],
        graduationYear: null,
        program: null,
        openToWork: false,
    };
}

const ring = [member(0), member(3), member(7)];

describe("findRingDestination", () => {
    it("moves to the neighbouring member", () => {
        expect(findRingDestination(ring, 3, "next")?.domain).toBe("https://site7.dev");
        expect(findRingDestination(ring, 3, "prev")?.domain).toBe("https://site0.dev");
    });

    it("wraps around at both ends", () => {
        expect(findRingDestination(ring, 7, "next")?.domain).toBe("https://site0.dev");
        expect(findRingDestination(ring, 0, "prev")?.domain).toBe("https://site7.dev");
    });

    it("handles ids that aren't (or are no longer) in the ring", () => {
        expect(findRingDestination(ring, 5, "next")?.domain).toBe("https://site7.dev");
        expect(findRingDestination(ring, 5, "prev")?.domain).toBe("https://site3.dev");
        expect(findRingDestination(ring, 999, "next")?.domain).toBe("https://site0.dev");
        expect(findRingDestination(ring, -1, "prev")?.domain).toBe("https://site7.dev");
    });

    it("sends a lone member back to their own site", () => {
        expect(findRingDestination([member(4)], 4, "next")?.domain).toBe("https://site4.dev");
    });

    it("returns the slot itself when two members share a domain, so stats credit the right one", () => {
        const shared = [member(10, "https://x.dev"), member(19), member(20, "https://x.dev")];
        expect(findRingDestination(shared, 19, "next")?.ringId).toBe(20);
    });

    it("returns null for an empty ring", () => {
        expect(findRingDestination([], 0, "next")).toBeNull();
    });
});

describe("ringMembers", () => {
    it("drops members without a linkable http(s) site", () => {
        const profiles = [member(1), member(2, ""), member(3, "javascript:alert(1)"), member(4, "not a url")];
        expect(ringMembers(profiles).map((profile) => profile.ringId)).toEqual([1]);
    });
});
