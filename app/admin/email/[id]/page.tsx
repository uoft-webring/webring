import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { requireAdmin } from "@/lib/admin";
import { getCampaign, listDeliveries } from "@/lib/email/campaigns";
import { renderEmail } from "@/lib/email/format";
import { emailConfig } from "@/lib/email/transport";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminNav } from "../../AdminNav";
import { CampaignReport } from "../CampaignReport";
import { Composer } from "../Composer";
import { loadComposerMembers } from "../data";

export const metadata: Metadata = { title: "Email", robots: { index: false } };

// Server actions run in this page's function: a send batch takes a few seconds
export const maxDuration = 60;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A draft opens in the composer; a sent (or sending) email shows who got it. */
export default async function EmailCampaignPage({ params }: PageProps<"/admin/email/[id]">) {
    const admin = await requireAdmin();
    const { id } = await params;
    if (!UUID.test(id)) notFound();

    const db = createAdminClient();
    const campaign = await getCampaign(db, id);
    if (!campaign) notFound();

    const self = { name: admin.name, ringId: admin.ringId, slug: admin.slug, domain: admin.domain };
    const postalAddress = serverEnv().EMAIL_POSTAL_ADDRESS ?? null;
    const { problem } = emailConfig();

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={admin} />
            <main className="mx-auto w-full max-w-6xl px-6 pb-16">
                <AdminNav current="/admin/email" />
                <p className="mb-2 text-sm">
                    <Link href="/admin/email" className="text-muted-foreground underline-offset-4 hover:underline">
                        ← All emails
                    </Link>
                </p>
                {campaign.status === "draft" ? (
                    <>
                        <h1 className="mb-8">Edit draft</h1>
                        <Composer
                            initial={{ id: campaign.id, subject: campaign.subject, body: campaign.body, audience: campaign.audience }}
                            members={await loadComposerMembers()}
                            self={self}
                            sendingProblem={problem}
                            postalAddress={postalAddress}
                        />
                    </>
                ) : (
                    <CampaignReport
                        campaign={campaign}
                        deliveries={await listDeliveries(db, campaign.id)}
                        previewHtml={renderEmail(campaign, self, { unsubscribeUrl: "#unsubscribe", postalAddress: postalAddress ?? undefined }).html}
                        sendingProblem={problem}
                    />
                )}
            </main>
        </div>
    );
}
