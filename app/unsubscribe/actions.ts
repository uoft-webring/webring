"use server";

import { z } from "zod";
import { setEmailSubscription, verifyUnsubscribeParams } from "@/lib/email/unsubscribe";
import { fail, ok, type Result } from "@/lib/result";

const inputSchema = z.object({ m: z.string(), t: z.string(), subscribed: z.boolean() });

/** Unsubscribes or resubscribes the member a signed link belongs to. */
export async function setSubscription(input: unknown): Promise<Result<{ subscribed: boolean }>> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return fail("Invalid request.");
    const profileId = verifyUnsubscribeParams({ m: parsed.data.m, t: parsed.data.t });
    if (!profileId) return fail("This link isn't valid. Use the link from your most recent email.");
    if (!(await setEmailSubscription(profileId, parsed.data.subscribed))) return fail("Could not save that. Please try again.");
    return ok({ subscribed: parsed.data.subscribed });
}
