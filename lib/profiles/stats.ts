import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { fail, ok, type Result } from "@/lib/result";

export const STATS_WINDOW_DAYS = 30;

export type DailyVisits = { day: string; inbound: number; outbound: number };

export type RingStats = {
    /** One entry per day, oldest first, zero-filled so charts have no gaps. */
    days: DailyVisits[];
    inbound7: number;
    inbound30: number;
    outbound30: number;
};

function isoDay(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/** Hops in and out of one member's site over the last 30 days (UTC days, matching record_ring_hop). */
export async function getRingStats(ringId: number): Promise<Result<RingStats>> {
    const today = new Date();
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (STATS_WINDOW_DAYS - 1)));

    // ring_visit_daily isn't exposed to members; the caller is already scoped to their own ring id
    const { data, error } = await createAdminClient()
        .from("ring_visit_daily")
        .select("day, inbound, outbound")
        .eq("ring_id", ringId)
        .gte("day", isoDay(start))
        .returns<DailyVisits[]>();

    if (error) {
        console.error("[stats] Failed to load ring stats:", error.message);
        return fail("Could not load your stats.");
    }

    const byDay = new Map(data.map((row) => [row.day, row]));
    const days = Array.from({ length: STATS_WINDOW_DAYS }, (_, index) => {
        const day = isoDay(new Date(start.getTime() + index * 86_400_000));
        return byDay.get(day) ?? { day, inbound: 0, outbound: 0 };
    });
    const sum = (rows: DailyVisits[], key: "inbound" | "outbound") => rows.reduce((total, row) => total + row[key], 0);

    return ok({
        days,
        inbound7: sum(days.slice(-7), "inbound"),
        inbound30: sum(days, "inbound"),
        outbound30: sum(days, "outbound"),
    });
}
