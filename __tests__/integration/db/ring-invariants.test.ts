import { describe, expect, it } from "vitest";
import { PUBLIC_PROFILE_COLUMNS, toPublicProfile, type PublicProfileRow } from "@/lib/profiles/mapper";
import { findRingDestination, isLinkableDomain, ringMembers } from "@/lib/profiles/ring";
import type { PublicProfile } from "@/lib/profiles/types";
import { dbTestsEnabled, serviceReadClient } from "./client";

// Read-only. Runs the real ring helpers over the real public rows, read the way the app reads them
// (lib/profiles/queries.ts: ordered by ring_id ascending, service role because anon has no grant).

async function loadRing(): Promise<{ all: PublicProfile[]; rows: PublicProfileRow[] }> {
    const { data, error } = await serviceReadClient()
        .from("profile")
        .select(PUBLIC_PROFILE_COLUMNS)
        .order("ring_id", { ascending: true })
        .returns<PublicProfileRow[]>();
    if (error) throw new Error(`profile read failed: ${error.message}`);
    return { all: data.map(toPublicProfile), rows: data };
}

describe.skipIf(!dbTestsEnabled())("ring invariants on real data", () => {
    it("ring ids are unique across all profile rows", async () => {
        const { rows } = await loadRing();
        expect(rows.length).toBeGreaterThan(0);
        const ids = rows.map((row) => row.ring_id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("every ring member has a valid http(s) domain", async () => {
        const { all } = await loadRing();
        const members = ringMembers(all);
        expect(members.length).toBeGreaterThan(0);

        const bad = members.filter((member) => {
            try {
                const { protocol } = new URL(member.domain);
                return protocol !== "http:" && protocol !== "https:";
            } catch {
                return true;
            }
        });
        expect(bad.map((member) => [member.ringId, member.domain])).toEqual([]);
        expect(members.every((member) => isLinkableDomain(member.domain))).toBe(true);
    });

    it("the ring is sorted by ringId ascending, which findRingDestination relies on", async () => {
        const { all } = await loadRing();
        const ids = ringMembers(all).map((member) => member.ringId);
        expect(ids).toEqual([...ids].sort((a, b) => a - b));
    });

    it("next and prev wrap around at both ends and are inverses of each other", async () => {
        const { all } = await loadRing();
        const members = ringMembers(all);
        expect(members.length).toBeGreaterThan(0);

        const first = members[0];
        const last = members[members.length - 1];
        expect(first).toBeDefined();
        expect(last).toBeDefined();
        if (!first || !last) return;

        // Wrap-around at the ends
        expect(findRingDestination(members, last.ringId, "next")?.ringId).toBe(first.ringId);
        expect(findRingDestination(members, first.ringId, "prev")?.ringId).toBe(last.ringId);

        // Every member's neighbours are the adjacent members, and stepping back undoes stepping forward
        members.forEach((member, index) => {
            const expectedNext = members[(index + 1) % members.length];
            const expectedPrev = members[(index - 1 + members.length) % members.length];
            expect(findRingDestination(members, member.ringId, "next")?.ringId).toBe(expectedNext?.ringId);
            expect(findRingDestination(members, member.ringId, "prev")?.ringId).toBe(expectedPrev?.ringId);

            const forward = findRingDestination(members, member.ringId, "next");
            expect(forward && findRingDestination(members, forward.ringId, "prev")?.ringId).toBe(
                member.ringId
            );
        });
    });

    it("the footer's ring id 0 resolves to a real member in both directions", async () => {
        const { all } = await loadRing();
        const members = ringMembers(all);
        expect(findRingDestination(members, 0, "next")).not.toBeNull();
        expect(findRingDestination(members, 0, "prev")).not.toBeNull();
    });
});
