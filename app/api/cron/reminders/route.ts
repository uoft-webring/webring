import { NextResponse, type NextRequest } from "next/server";
import { isAuthorized } from "@/lib/bearer";
import { sendEmail } from "@/lib/email";
import { serverEnv, siteUrl } from "@/lib/env";
import { REMINDER_BATCH_SIZE, reminderEmail } from "@/lib/reminders";
import { fail, ok, type Result } from "@/lib/result";
import { profileUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/server";
import { unsubscribeUrls } from "@/lib/unsubscribe";

export const maxDuration = 300;

type ClaimedMember = {
    id: string;
    email: string;
    name: string | null;
    domain: string | null;
    slug: string | null;
    tagline: string | null;
    image_key: string | null;
    tags: string[] | null;
    ring_status: "disconnected" | "pending" | "connected" | null;
    previous_reminded_at: string | null;
};

// Counts only: Actions logs on a public repo are public, so this must never include emails
type ReminderRun = { mode: "dry-run" | "send"; due: number; sent: number; failed: number };

// SES starts accounts at 1 email a second
const SEND_GAP_MS = 1100;

/** Called by .github/workflows/reminders.yml. `?mode=send` emails people; anything else is a dry run. */
export async function POST(request: NextRequest): Promise<NextResponse<Result<ReminderRun>>> {
    const env = serverEnv();
    if (!env.CRON_SECRET) {
        console.error("[reminders] CRON_SECRET is not set.");
        return NextResponse.json(fail("Server configuration error."), { status: 500 });
    }
    if (!isAuthorized(request.headers.get("authorization"), env.CRON_SECRET)) {
        return NextResponse.json(fail("Unauthorized."), { status: 401 });
    }

    const mode = request.nextUrl.searchParams.get("mode") === "send" ? "send" : "dry-run";
    // Local and preview deployments can hold real members' data and AWS keys: only production emails
    if (mode === "send" && env.VERCEL_ENV !== "production") {
        return NextResponse.json(fail("Sending only runs on the production deployment."), { status: 403 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc("claim_profile_reminders", {
        max_count: REMINDER_BATCH_SIZE,
        dry_run: mode === "dry-run",
    });
    if (error) {
        console.error("[reminders] claim_profile_reminders failed:", error.message);
        return NextResponse.json(fail("Could not load members."), { status: 500 });
    }
    const members = data as ClaimedMember[];
    if (mode === "dry-run") return NextResponse.json(ok({ mode, due: members.length, sent: 0, failed: 0 }));

    let sent = 0;
    let failed = 0;
    for (const [index, member] of members.entries()) {
        if (index > 0) await new Promise((resolve) => setTimeout(resolve, SEND_GAP_MS));

        const unsubscribe = unsubscribeUrls("member", member.id);
        const message = reminderEmail(
            {
                name: member.name ?? "",
                domain: member.domain ?? "",
                tagline: member.tagline ?? "",
                imageKey: member.image_key ?? "",
                tags: member.tags ?? [],
                ringStatus: member.ring_status ?? "disconnected",
            },
            {
                edit: siteUrl("/dashboard/edit"),
                profile: member.slug ? profileUrl(member.slug) : null,
                unsubscribe: unsubscribe.page,
            }
        );
        const outcome = await sendEmail({
            to: member.email,
            ...message,
            oneClickUnsubscribeUrl: unsubscribe.oneClick,
        });

        if (outcome === "sent") {
            sent++;
            continue;
        }
        failed++;
        // Maybe delivered, or can never be: keep the claim. Skipping someone for 8 months beats
        // emailing them twice or retrying a bad address forever
        if (outcome !== "retryable") continue;
        // Not sent, for a reason that may clear: un-claim so the next run retries this member
        const { error: releaseError } = await admin
            .from("member_email_pref")
            .update({ last_reminded_at: member.previous_reminded_at })
            .eq("profile_id", member.id);
        if (releaseError) console.error("[reminders] Failed to release a claim:", releaseError.message);
    }

    return NextResponse.json(ok({ mode, due: members.length, sent, failed }));
}
