import { NextResponse, type NextRequest } from "next/server";
import { cronAuthError, cronMode, pauseBetweenSends } from "@/lib/cron";
import { sendEmail } from "@/lib/email";
import { serverEnv, siteUrl } from "@/lib/env";
import { INVITE_BATCH_SIZE, inviteEmail } from "@/lib/invites";
import { fail, ok, type Result } from "@/lib/result";
import { createAdminClient } from "@/lib/supabase/server";
import { unsubscribeUrls } from "@/lib/unsubscribe";

export const maxDuration = 300;

type ClaimedInvite = { id: string; email: string; name: string | null; website: string };

// Counts only: Actions logs on a public repo are public, so this must never include emails
type InviteRun = { mode: "dry-run" | "send"; approved: number; sent: number; failed: number };

/** Emails approved candidates once. Called by .github/workflows/invites.yml. */
export async function POST(request: NextRequest): Promise<NextResponse<Result<InviteRun>>> {
    const authError = cronAuthError(request);
    if (authError) return authError;

    const mode = cronMode(request);
    if (mode === "send" && !serverEnv().RESEND_API_KEY) {
        return NextResponse.json(fail("RESEND_API_KEY is not set."), { status: 500 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc("claim_invites", { max_count: INVITE_BATCH_SIZE, dry_run: mode === "dry-run" });
    if (error) {
        console.error("[invites] claim_invites failed:", error.message);
        return NextResponse.json(fail("Could not load candidates."), { status: 500 });
    }
    const invites = data as ClaimedInvite[];
    if (mode === "dry-run") return NextResponse.json(ok({ mode, approved: invites.length, sent: 0, failed: 0 }));

    let sent = 0;
    let failed = 0;
    for (const [index, invite] of invites.entries()) {
        if (index > 0) await pauseBetweenSends();

        const unsubscribe = unsubscribeUrls("invite", invite.id);
        const message = inviteEmail(invite, { join: siteUrl("/signup"), site: siteUrl("/"), unsubscribe: unsubscribe.page });
        const outcome = await sendEmail({
            to: invite.email,
            ...message,
            oneClickUnsubscribeUrl: unsubscribe.oneClick,
            idempotencyKey: `invite-${invite.id}`,
        });

        if (outcome === "sent") {
            sent++;
            continue;
        }
        failed++;
        // Maybe delivered, or can never be: leave it as invited. We promise strangers a single
        // email, and a bad address shouldn't be retried forever
        if (outcome !== "retryable") continue;
        // Not sent, for a reason that may clear: back to approved so the next run retries, unless
        // the owner has changed the status in the meantime
        const { error: releaseError } = await admin
            .from("invite_candidate")
            .update({ status: "approved", invited_at: null })
            .eq("id", invite.id)
            .eq("status", "invited");
        if (releaseError) console.error("[invites] Failed to release a claim:", releaseError.message);
    }

    return NextResponse.json(ok({ mode, approved: invites.length, sent, failed }));
}
