import type { PublicProfile } from "./types";

/**
 * Members who appear in the ring: they have a site to link to, and it isn't down (`siteDown`, from
 * the ring checks). Every front door (/redirect, /, /plain, previews) uses this, so they agree.
 */
export function ringMembers(profiles: PublicProfile[]): PublicProfile[] {
    const linkable = linkableMembers(profiles);
    const up = linkable.filter((profile) => !profile.siteDown);
    // Over half the ring down at once means the checker broke (egress, DNS), not the sites: ignore it
    return up.length * 2 >= linkable.length ? up : linkable;
}

/**
 * Whether a /redirect request is a real visitor clicking the member's widget on their own site:
 * the browser says it's a cross-site navigation (fetch metadata a page's script can't forge), and
 * the referring page is on the member's domain (ignoring www.).
 */
export function isOwnSiteReferral(
    headers: { referer: string | null; fetchMode: string | null; fetchSite: string | null },
    memberDomain: string
): boolean {
    if (headers.fetchMode !== "navigate" || headers.fetchSite !== "cross-site" || !headers.referer) return false;
    try {
        const host = (url: string) => new URL(url).hostname.toLowerCase().replace(/^www\./, "");
        return host(headers.referer) === host(memberDomain);
    } catch {
        return false;
    }
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

/** A site that's down (no answer, 5xx, 404/410) on this many checks in a row leaves the ring until it's back. */
export const DOWN_AFTER_FAILED_CHECKS = 2;

export function isSiteDown(consecutiveDown: number): boolean {
    return consecutiveDown >= DOWN_AFTER_FAILED_CHECKS;
}

/** Members with a site to link to, down or not: who can be a hop's source. */
export function linkableMembers(profiles: PublicProfile[]): PublicProfile[] {
    return profiles.filter((profile) => isLinkableDomain(profile.domain));
}
