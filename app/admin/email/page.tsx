import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin";
import { describeAudience } from "@/lib/email/audience";
import { listCampaigns } from "@/lib/email/campaigns";
import { emailConfig } from "@/lib/email/transport";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminNav } from "../AdminNav";
import { STATUS_LABEL } from "./types";

export const metadata: Metadata = { title: "Email", robots: { index: false } };

const dateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" });

/** Emails to members, newest first. Admins only (ADMIN_EMAILS). */
export default async function AdminEmailPage() {
    const admin = await requireAdmin();
    const campaigns = await listCampaigns(createAdminClient());
    const { problem } = emailConfig();

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={admin} />
            <main className="mx-auto w-full max-w-4xl px-6 pb-16">
                <AdminNav current="/admin/email" />
                <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
                    <h1>Email</h1>
                    <Button asChild>
                        <Link href="/admin/email/new">New email</Link>
                    </Button>
                </div>
                <p className="text-muted-foreground mb-8">
                    Write to members: everyone, or a filtered group. Every email has an unsubscribe link, and members who use it are
                    never emailed again from here.
                </p>
                {problem && (
                    <p role="status" className="border-border mb-6 rounded-xl border border-dashed p-4 text-sm">
                        {problem} Drafts still work.
                    </p>
                )}

                {campaigns.length === 0 ? (
                    <p className="border-border rounded-2xl border border-dashed p-6">No emails yet. Start one with New email.</p>
                ) : (
                    <ul className="border-border divide-border divide-y rounded-2xl border">
                        {campaigns.map((campaign) => {
                            const when = campaign.finishedAt ?? campaign.startedAt ?? campaign.updatedAt;
                            const trouble = campaign.counts.failed + campaign.counts.rejected + campaign.counts.unknown;
                            return (
                                <li key={campaign.id}>
                                    <Link
                                        href={`/admin/email/${campaign.id}`}
                                        className="hover:bg-muted/50 focus-visible:bg-muted/50 flex flex-col gap-2 p-5 transition-colors motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <p className="truncate font-semibold">{campaign.subject}</p>
                                            <p className="text-muted-foreground text-sm">{describeAudience(campaign.audience)}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center gap-3 text-sm">
                                            {campaign.status !== "draft" && (
                                                <span>
                                                    {campaign.counts.sent} of {campaign.counts.total} sent
                                                    {trouble > 0 && <span className="text-destructive"> · {trouble} not delivered</span>}
                                                </span>
                                            )}
                                            <span className="text-muted-foreground">{dateFormat.format(new Date(when))}</span>
                                            <Badge variant={campaign.status === "sent" ? "secondary" : campaign.status === "sending" ? "default" : "outline"}>
                                                {STATUS_LABEL[campaign.status]}
                                            </Badge>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </main>
        </div>
    );
}
