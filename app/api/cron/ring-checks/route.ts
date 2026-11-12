import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { cronAuthError } from "@/lib/cron";
import { PROFILES_TAG } from "@/lib/profiles/queries";
import { recordRingCheck } from "@/lib/profiles/ring-link-state";
import type { RingStatus } from "@/lib/profiles/types";
import { ok, fail, type Result } from "@/lib/result";
import { statusAfterRecheck } from "@/lib/ring-link";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRingWidget } from "@/lib/verification";

export const maxDuration = 300;

// 40 sites, 5 at a time, each capped at 8s: well inside the 300s limit
const BATCH_SIZE = 40;
const CONCURRENCY = 5;

type DueMember = { id: string; ring_id: number; domain: string; status: RingStatus };

// Counts only: Actions logs on a public repo are public
type RecheckRun = { mode: "check" | "dry-run"; due: number; found: number; movedToReview: number; reconnected: number; failed: number };

/** Weekly re-check of members' widgets. Called by .github/workflows/ring-checks.yml. */
export async function POST(request: NextRequest): Promise<NextResponse<Result<RecheckRun>>> {
    const authError = cronAuthError(request);
    if (authError) return authError;
    const mode = request.nextUrl.searchParams.get("mode") === "dry-run" ? "dry-run" : "check";

    const admin = createAdminClient();
    const { data, error } = await admin.rpc("ring_checks_due", { max_count: BATCH_SIZE });
    if (error) {
        console.error("[ring-checks] ring_checks_due failed:", error.message);
        return NextResponse.json(fail("Could not load members."), { status: 500 });
    }
    const due = data as DueMember[];
    const run: RecheckRun = { mode, due: due.length, found: 0, movedToReview: 0, reconnected: 0, failed: 0 };
    if (mode === "dry-run") return NextResponse.json(ok(run));

    const recheck = async (member: DueMember) => {
        const result = await checkRingWidget(member.domain, member.ring_id);
        if (result === "found") run.found++;
        const state = await recordRingCheck(member.id, result);
        if (!state) {
            run.failed++;
            return;
        }
        const next = statusAfterRecheck(member.status, result, state.consecutiveFailures, state.lastClickVerifiedAt);
        if (next === member.status) return;
        const { error: updateError } = await admin
            .from("profile")
            .update({ validated_user_component: next })
            .eq("id", member.id)
            // A member who changed their domain since the batch was loaded gets checked next week
            .eq("domain", member.domain);
        if (updateError) {
            console.error("[ring-checks] Failed to update status:", updateError.message);
            run.failed++;
        } else if (next === "pending") run.movedToReview++;
        else if (next === "connected") run.reconnected++;
    };

    for (let i = 0; i < due.length; i += CONCURRENCY) {
        await Promise.all(due.slice(i, i + CONCURRENCY).map(recheck));
    }
    if (run.movedToReview + run.reconnected > 0) revalidateTag(PROFILES_TAG, { expire: 0 });
    return NextResponse.json(ok(run));
}
