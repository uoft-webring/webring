import type { PublicProfile } from "./types";

/** Members who appear in the ring: they have a site to link to. */
export function ringMembers(profiles: PublicProfile[]): PublicProfile[] {
    return profiles.filter((profile) => isLinkableDomain(profile.domain));
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

/**
 * Member to send a visitor to from member `ringId`, wrapping around at both ends.
 * `ringId` need not belong to a ring member (e.g. the footer links use 0).
 */
export function findRingDestination(
    members: PublicProfile[],
    ringId: number,
    direction: "next" | "prev"
): PublicProfile | null {
    if (members.length === 0) return null;
    // `members` is sorted by ringId ascending
    if (direction === "next") {
        return members.find((member) => member.ringId > ringId) ?? members[0];
    }
    return members.findLast((member) => member.ringId < ringId) ?? members[members.length - 1];
}
