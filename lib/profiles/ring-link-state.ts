import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import type { RingProbe, RingWidgetResult } from "@/lib/verification";

export type RingLinkState = {
    lastCheckedAt: Date | null;
    lastResult: RingWidgetResult | null;
    lastClickVerifiedAt: Date | null;
    consecutiveDown: number;
};

const date = (value: string | null): Date | null => (value ? new Date(value) : null);

/** The last check of a member's widget, for the join page and review queue. Null if never checked. */
export async function getRingLinkState(profileId: string): Promise<RingLinkState | null> {
    const { data, error } = await createAdminClient()
        .from("ring_link_state")
        .select("last_checked_at, last_result, last_click_verified_at, consecutive_down")
        .eq("profile_id", profileId)
        .maybeSingle<{
            last_checked_at: string | null;
            last_result: RingWidgetResult | null;
            last_click_verified_at: string | null;
            consecutive_down: number;
        }>();
    if (error) {
        console.error("[ring] Failed to load link state:", error.message);
        return null;
    }
    if (!data) return null;
    return {
        lastCheckedAt: date(data.last_checked_at),
        lastResult: data.last_result,
        lastClickVerifiedAt: date(data.last_click_verified_at),
        consecutiveDown: data.consecutive_down,
    };
}

/** Records a check (with response details if known); returns the widget and down streaks and last click confirmation. */
export async function recordRingCheck(
    profileId: string,
    result: RingWidgetResult,
    response?: Pick<RingProbe, "httpStatus" | "latencyMs">
): Promise<{ consecutiveFailures: number; lastClickVerifiedAt: Date | null; consecutiveDown: number } | null> {
    const { data, error } = await createAdminClient()
        .rpc("record_ring_check", {
            member: profileId,
            result,
            status_code: response?.httpStatus ?? null,
            elapsed_ms: response?.latencyMs ?? null,
        })
        .single<{ consecutive_failures: number; last_click_verified_at: string | null; consecutive_down: number }>();
    if (error) {
        console.error("[ring] Failed to record check:", error.message);
        return null;
    }
    return {
        consecutiveFailures: data.consecutive_failures,
        lastClickVerifiedAt: date(data.last_click_verified_at),
        consecutiveDown: data.consecutive_down,
    };
}
