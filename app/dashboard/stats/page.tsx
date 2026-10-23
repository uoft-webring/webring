import type { Metadata } from "next";
import { VisitsChart } from "@/components/dashboard/VisitsChart";
import { requireOwnProfile } from "@/lib/auth";
import { getRingStats, STATS_WINDOW_DAYS } from "@/lib/profiles/stats";

export const metadata: Metadata = { title: "Ring stats", robots: { index: false } };

function StatTile({ label, value, hint }: { label: string; value: number; hint: string }): React.JSX.Element {
    return (
        <div className="bg-card flex flex-col gap-1 rounded-xl border p-5">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="text-4xl font-semibold tabular-nums">{value.toLocaleString("en-CA")}</span>
            <span className="text-muted-foreground text-xs">{hint}</span>
        </div>
    );
}

export default async function StatsPage() {
    const profile = await requireOwnProfile();
    const { data: stats, error } = await getRingStats(profile.ringId);

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h2>Your ring stats</h2>
                <p className="mb-2">
                    Visitors who arrived at your site through the ring, and visitors who left your site through
                    your ring widget.
                </p>
            </div>

            {error !== null ? (
                <p role="alert" className="text-destructive">
                    {error}
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatTile label="Visitors sent to you" value={stats.inbound7} hint="last 7 days" />
                        <StatTile label="Visitors sent to you" value={stats.inbound30} hint={`last ${STATS_WINDOW_DAYS} days`} />
                        <StatTile label="Visitors you sent on" value={stats.outbound30} hint={`last ${STATS_WINDOW_DAYS} days`} />
                    </div>
                    <VisitsChart days={stats.days} />
                    {profile.ringStatus !== "connected" && (
                        <p className="text-muted-foreground text-sm">
                            Add the ring widget to your site (Join step) so visitors can hop to and from it.
                        </p>
                    )}
                </>
            )}
        </section>
    );
}
