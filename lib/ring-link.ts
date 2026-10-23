import type { RingStatus } from "@/lib/profiles/types";
import type { RingWidgetResult } from "@/lib/verification";

/** How long a click from the member's own site counts as proof their widget works. */
export const CLICK_PROOF_DAYS = 30;

/** What each check result means for the member, and what to do about it. */
export function ringCheckMessage(result: RingWidgetResult, ringId: number): string {
    switch (result) {
        case "found":
            return "Found both ring links on your site. You're in the ring.";
        case "partial":
            return "We found only one of the two ring links. Add both the previous and next links from the snippet above.";
        case "wrong_id":
            return `Your site has ring links, but they point at another member. Copy the snippet above again: yours use id=${ringId}.`;
        case "missing":
            return "Your homepage doesn't have the ring links yet. Paste the snippet above into your site and publish it. If your site adds links with JavaScript, they'll be confirmed once visitors click them.";
        case "js_rendered":
            return "Your site builds its page with JavaScript, so we can't see the links by fetching it. We'll confirm them automatically once visitors click your widget; until then a maintainer will review it.";
        case "unreachable":
            return "We couldn't load your homepage. Check that it's live, then try again.";
    }
}

/** Short, neutral description of a check result, for the review queue. */
export const RING_CHECK_SUMMARY: Record<RingWidgetResult, string> = {
    found: "Both links found",
    partial: "Only one of the two links found",
    wrong_id: "Links point at another member's id",
    missing: "No ring links in the page's HTML",
    js_rendered: "Page is rendered with JavaScript",
    unreachable: "Site didn't load",
};

/** Status after a member checks their own site from the join page. */
export function statusAfterCheck(result: RingWidgetResult, current: RingStatus): RingStatus {
    if (result === "found") return "connected";
    // Can't tell either way: don't move them, and don't fill the review queue with outages
    if (result === "unreachable") return current;
    if (result === "js_rendered") return "pending";
    return "disconnected";
}

/**
 * Status after a weekly re-check. A connected member is only moved back to review after two
 * failed checks in a row and no recent clicks from their site: JavaScript-rendered sites always
 * "fail" the HTML check, and sites go down for a day.
 */
export function statusAfterRecheck(
    current: RingStatus,
    result: RingWidgetResult,
    consecutiveFailures: number,
    lastClickVerifiedAt: Date | null,
    now: Date = new Date()
): RingStatus {
    if (result === "found") return "connected";
    if (current !== "connected") return current;
    const recentClick =
        lastClickVerifiedAt !== null && now.getTime() - lastClickVerifiedAt.getTime() < CLICK_PROOF_DAYS * 86_400_000;
    return consecutiveFailures >= 2 && !recentClick ? "pending" : "connected";
}
