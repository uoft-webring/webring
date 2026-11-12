"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { isAdminEmail } from "@/lib/admin";
import { getOwnProfile } from "@/lib/auth";
import { PROFILES_TAG } from "@/lib/profiles/queries";
import { fail, ok, type Result } from "@/lib/result";
import { createAdminClient } from "@/lib/supabase/server";

const decisionSchema = z.object({
    ringId: z.number().int().nonnegative(),
    decision: z.enum(["approve", "reject"]),
});

/** Approve (connected) or reject (disconnected) a site waiting for review. Admins only. */
export async function reviewRingLink(input: unknown): Promise<Result<null>> {
    const parsed = decisionSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid request.");

    const viewer = await getOwnProfile();
    if (!viewer || !isAdminEmail(viewer.email)) return fail("Not allowed.");

    const status = parsed.data.decision === "approve" ? "connected" : "disconnected";
    const { data, error } = await createAdminClient()
        .from("profile")
        .update({ validated_user_component: status })
        .eq("ring_id", parsed.data.ringId)
        // Only sites still waiting: two admins acting at once can't undo each other
        .eq("validated_user_component", "pending")
        .select("ring_id");
    if (error) {
        console.error("[admin] Review failed:", error.message);
        return fail("Could not save that. Please try again.");
    }
    if (data.length === 0) return fail("That site isn't waiting for review any more.");

    updateTag(PROFILES_TAG);
    return ok(null);
}
