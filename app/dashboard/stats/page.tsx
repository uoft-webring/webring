import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/Panel";
import { VisitsChart } from "@/components/dashboard/VisitsChart";
import { requireOwnProfile } from "@/lib/auth";
import { getRingStats, STATS_WINDOW_DAYS } from "@/lib/profiles/stats";

export const metadata: Metadata = { title: "Ring stats", robots: { index: false } };

function StatTile({ label, value }: { label: string; value: number }): React.JSX.Element {
    return (
        <div className="bg-card flex flex-col gap-2 rounded-xl border p-5">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="text-4xl font-semibold tabular-nums">{value.toLocaleString("en-CA")}</span>
        </div>
    );
}

export default async function StatsPage() {
    const profile = await requireOwnProfile();
    const { data: stats, error } = await getRingStats(profile.ringId);

    return (
        <section className="flex flex-col gap-6">
            <PageHeader
                title="Your ring stats"
                description="Visitors who arrived at your site through the ring, and visitors who left your site through your ring widget."
            />

            {error !== null ? (
                <p role="alert" className="text-destructive">
                    {error}
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatTile label="Sent to you, past 7 days" value={stats.inbound7} />
                        <StatTile
                            label={`Sent to you, past ${STATS_WINDOW_DAYS} days`}
                            value={stats.inbound30}
                        />
                        <StatTile
                            label={`You sent on, past ${STATS_WINDOW_DAYS} days`}
                            value={stats.outbound30}
                        />
                    </div>
                    <VisitsChart days={stats.days} />
                    {profile.ringStatus !== "connected" && (
                        <p className="text-muted-foreground text-sm">
                            <Link
                                href="/dashboard/join"
                                className="text-foreground underline underline-offset-4"
                            >
                                Add the ring widget to your site
                            </Link>{" "}
                            so visitors can hop to and from it.
                        </p>
                    )}
                </>
            )}
        </section>
    );
}
