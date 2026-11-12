import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { requireAdmin } from "@/lib/admin";
import { RING_CHECK_SUMMARY } from "@/lib/ring-link";
import { displayDomain, profilePath } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/server";
import type { RingWidgetResult } from "@/lib/verification";
import { ReviewButtons } from "./ReviewButtons";

export const metadata: Metadata = { title: "Ring review", robots: { index: false } };

const dateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" });

type PendingRow = {
    ring_id: number;
    name: string | null;
    slug: string | null;
    domain: string | null;
    ring_link_state: {
        last_checked_at: string | null;
        last_result: RingWidgetResult | null;
        last_click_verified_at: string | null;
    } | null;
};

/** Sites the automatic checks couldn't confirm. Admins only (ADMIN_EMAILS). */
export default async function RingReviewPage() {
    const admin = await requireAdmin();
    const { data, error } = await createAdminClient()
        .from("profile")
        .select("ring_id, name, slug, domain, ring_link_state(last_checked_at, last_result, last_click_verified_at)")
        .eq("validated_user_component", "pending")
        .order("ring_id")
        .returns<PendingRow[]>();
    if (error) throw new Error(error.message);

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={admin} />
            <main className="mx-auto w-full max-w-4xl px-6 pb-16">
                <h1 className="mb-2">Ring review</h1>
                <p className="text-muted-foreground mb-8">
                    Sites waiting for a person to check their ring widget. Approve once you&apos;ve seen working
                    previous and next links on the site; reject to send the member back to the join page.
                </p>

                {data.length === 0 ? (
                    <p className="border-border rounded-2xl border border-dashed p-6">Nothing waiting for review.</p>
                ) : (
                    <ul className="border-border divide-border divide-y rounded-2xl border">
                        {data.map((row) => {
                            const state = row.ring_link_state;
                            const name = row.name || "Unnamed member";
                            return (
                                <li key={row.ring_id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 space-y-1">
                                        <p className="font-semibold">
                                            {row.slug ? (
                                                <Link href={profilePath(row.slug)} className="underline-offset-4 hover:underline">
                                                    {name}
                                                </Link>
                                            ) : (
                                                name
                                            )}
                                            <span className="text-muted-foreground ml-2 text-sm font-normal">#{row.ring_id}</span>
                                        </p>
                                        {row.domain && (
                                            <a
                                                href={row.domain}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm underline underline-offset-4"
                                            >
                                                {displayDomain(row.domain)}
                                            </a>
                                        )}
                                        <p className="text-muted-foreground text-sm">
                                            {state?.last_result && state.last_checked_at
                                                ? `Checked ${dateFormat.format(new Date(state.last_checked_at))}: ${RING_CHECK_SUMMARY[state.last_result]}`
                                                : "Not checked automatically yet."}
                                        </p>
                                        {state?.last_click_verified_at && (
                                            <p className="text-muted-foreground text-sm">
                                                Visitors clicked their widget on {dateFormat.format(new Date(state.last_click_verified_at))}.
                                            </p>
                                        )}
                                    </div>
                                    <ReviewButtons ringId={row.ring_id} name={name} />
                                </li>
                            );
                        })}
                    </ul>
                )}
            </main>
        </div>
    );
}
