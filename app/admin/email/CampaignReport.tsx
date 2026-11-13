"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { describeAudience } from "@/lib/email/audience";
import type { CampaignSummary, DeliveryRow, DeliveryStatus } from "@/lib/email/campaigns";
import { retryFailedAction } from "./actions";
import { STATUS_LABEL } from "./types";
import { progressOf, useSending } from "./useSending";

const DELIVERY_LABEL: Record<DeliveryStatus, { label: string; help: string }> = {
    sent: { label: "Sent", help: "Accepted by the mail provider." },
    queued: { label: "Waiting", help: "Not sent yet." },
    sending: { label: "Sending", help: "Going out now." },
    failed: { label: "Failed", help: "Didn't go out for a reason that may clear (throttling, settings). Retry sends these again." },
    rejected: { label: "Rejected", help: "The provider refused the address. Retrying won't help." },
    unknown: { label: "Unclear", help: "Cut off mid-send, so it may have arrived. Never resent automatically." },
    skipped: { label: "Skipped", help: "Unsubscribed before their turn came." },
};

const SUMMARY_ORDER: DeliveryStatus[] = ["sent", "queued", "failed", "rejected", "unknown", "skipped"];

const dateFormat = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" });

type Props = {
    campaign: CampaignSummary;
    deliveries: DeliveryRow[];
    previewHtml: string;
    sendingProblem: string | null;
};

export function CampaignReport({ campaign, deliveries, previewHtml, sendingProblem }: Props): React.JSX.Element {
    const router = useRouter();
    const sending = useSending();
    const [pending, startTransition] = useTransition();
    const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
    const counts = sending.counts ?? campaign.counts;
    const progress = progressOf(counts);
    const busy = pending || sending.running;
    const unfinished = campaign.status === "sending" && counts.queued + counts.sending > 0;

    const resume = () =>
        startTransition(async () => {
            setNotice(null);
            await sending.run(campaign.id);
            router.refresh();
        });

    const retry = () =>
        startTransition(async () => {
            setNotice(null);
            const result = await retryFailedAction({ id: campaign.id });
            if (result.error !== null) {
                setNotice({ kind: "error", text: result.error });
                return;
            }
            if (result.data.queued === 0) {
                setNotice({ kind: "ok", text: "Nothing to retry." });
                return;
            }
            await sending.run(campaign.id);
            router.refresh();
        });

    return (
        <div className="space-y-10">
            <header className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="break-words">{campaign.subject}</h1>
                    <Badge variant={campaign.status === "sent" ? "secondary" : "default"}>{STATUS_LABEL[campaign.status]}</Badge>
                </div>
                <p className="text-muted-foreground">
                    {describeAudience(campaign.audience)}
                    {campaign.startedAt && ` · started ${dateFormat.format(new Date(campaign.startedAt))}`}
                    {campaign.sentBy && ` by ${campaign.sentBy}`}
                    {campaign.finishedAt && ` · finished ${dateFormat.format(new Date(campaign.finishedAt))}`}
                </p>
            </header>

            <section aria-labelledby="delivery-heading" className="space-y-4">
                <h2 id="delivery-heading" className="text-lg font-semibold">
                    Delivery
                </h2>
                <div className="space-y-2" aria-live="polite">
                    <progress className="accent-primary h-2 w-full" value={progress.finished} max={Math.max(progress.total, 1)} />
                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {SUMMARY_ORDER.map((status) => (
                            <div key={status} className="border-border rounded-xl border p-3" title={DELIVERY_LABEL[status].help}>
                                <dt className="text-muted-foreground text-xs">{DELIVERY_LABEL[status].label}</dt>
                                <dd className="text-xl font-semibold tabular-nums">{counts[status] + (status === "queued" ? counts.sending : 0)}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
                {sendingProblem && (unfinished || counts.failed > 0) && (
                    <p role="status" className="border-border rounded-xl border border-dashed p-3 text-sm">
                        {sendingProblem}
                    </p>
                )}
                <div className="flex flex-wrap gap-2">
                    {unfinished && (
                        <Button type="button" onClick={resume} disabled={busy || sendingProblem !== null}>
                            {sending.running ? "Sending…" : "Resume sending"}
                        </Button>
                    )}
                    {counts.failed > 0 && (
                        <Button type="button" variant="secondary" onClick={retry} disabled={busy || sendingProblem !== null}>
                            Retry {counts.failed} failed
                        </Button>
                    )}
                </div>
                {(sending.error || notice) && (
                    <p
                        role={sending.error || notice?.kind === "error" ? "alert" : "status"}
                        className={sending.error || notice?.kind === "error" ? "text-destructive text-sm" : "text-sm"}
                    >
                        {sending.error ?? notice?.text}
                    </p>
                )}
            </section>

            <section aria-labelledby="recipients-heading" className="space-y-4">
                <h2 id="recipients-heading" className="text-lg font-semibold">
                    Recipients ({deliveries.length})
                </h2>
                <div className="border-border overflow-x-auto rounded-2xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="text-muted-foreground border-border border-b">
                            <tr>
                                <th scope="col" className="p-3 font-medium">
                                    Member
                                </th>
                                <th scope="col" className="p-3 font-medium">
                                    Email
                                </th>
                                <th scope="col" className="p-3 font-medium">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                            {deliveries.map((delivery) => (
                                <tr key={delivery.id}>
                                    <td className="p-3">
                                        {delivery.name || "Unnamed member"}
                                        {delivery.ringId !== null && <span className="text-muted-foreground ml-2">#{delivery.ringId}</span>}
                                    </td>
                                    <td className="p-3 break-all">{delivery.email}</td>
                                    <td className="p-3">
                                        <span title={DELIVERY_LABEL[delivery.status].help}>{DELIVERY_LABEL[delivery.status].label}</span>
                                        {delivery.error && delivery.status !== "sent" && (
                                            <span className="text-muted-foreground block text-xs break-words">{delivery.error}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section aria-labelledby="content-heading" className="space-y-3">
                <h2 id="content-heading" className="text-lg font-semibold">
                    What was sent
                </h2>
                <p className="text-muted-foreground text-sm">Shown with your details filled in; each member got their own.</p>
                {/* sandbox with no permissions: the preview can't run scripts or navigate this page */}
                <iframe title="Email as sent" sandbox="" srcDoc={previewHtml} className="border-border h-[560px] w-full rounded-xl border bg-white" />
            </section>
        </div>
    );
}
