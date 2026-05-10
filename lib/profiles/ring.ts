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

/**
 * Site to send a visitor to from member `ringId`, wrapping around at both ends.
 * `ringId` need not belong to a ring member (e.g. the footer links use 0).
 */
export function findRingDestination(
    members: PublicProfile[],
    ringId: number,
    direction: "next" | "prev"
): string | null {
    if (members.length === 0) return null;
    // `members` is sorted by ringId ascending
    if (direction === "next") {
        return (members.find((member) => member.ringId > ringId) ?? members[0]).domain;
    }
    return (members.findLast((member) => member.ringId < ringId) ?? members[members.length - 1]).domain;
}
