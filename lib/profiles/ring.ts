import type { PublicProfile } from "./types";

/** Members who appear in the ring: they have a site to link to. */
export function ringMembers(profiles: PublicProfile[]): PublicProfile[] {
    return profiles.filter((profile) => isLinkableDomain(profile.domain));
}

export function isLinkableDomain(domain: string): boolean {
    try {
        return ["http:", "https:"].includes(new URL(domain).protocol);
    } catch {
        return false;
    }
}

export type RingDirection = "prev" | "next" | "random";

/**
 * Member to send a visitor to from member `ringId`: the neighbour (wrapping around at both ends), or
 * for "random" ("Surprise me") any member but the source. `ringId` need not belong to a ring member;
 * null means there is no source (footer link, missing or garbage id): next lands on the first member,
 * prev on the last.
 */
export function findRingDestination(
    members: PublicProfile[],
    ringId: number | null,
    direction: RingDirection,
    random: () => number = Math.random
): PublicProfile | null {
    if (members.length === 0) return null;
    if (direction === "random") return pickOther(members, ringId, random);
    // -1 sits before every ring id (they start at 0), so member 0 is reachable
    const from = ringId ?? -1;
    // `members` is sorted by ringId ascending
    if (direction === "next") {
        return members.find((member) => member.ringId > from) ?? members[0];
    }
    return members.findLast((member) => member.ringId < from) ?? members[members.length - 1];
}

/** Uniform pick that skips the source without copying the ring: draw from n - 1 slots, shift past it. */
function pickOther(members: PublicProfile[], ringId: number | null, random: () => number): PublicProfile {
    const source = ringId === null ? -1 : members.findIndex((member) => member.ringId === ringId);
    const slots = source === -1 ? members.length : members.length - 1;
    // The source is the only member: send them back rather than nowhere
    if (slots === 0) return members[0];
    const pick = Math.min(Math.floor(random() * slots), slots - 1);
    return members[source !== -1 && pick >= source ? pick + 1 : pick];
}
