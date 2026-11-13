import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { serverEnv, siteUrl } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";

// Signed links instead of sign-in: unsubscribing has to work in one click from the email. The prefix
// keeps these HMACs apart from the domain TXT values made with the same secret.
const PURPOSE = "email-unsubscribe:v1:";

export const unsubscribeParamsSchema = z.object({
    m: z.uuid(),
    t: z.string().min(20).max(100),
});

export type UnsubscribeParams = z.infer<typeof unsubscribeParamsSchema>;

export function unsubscribeToken(profileId: string): string {
    return createHmac("sha256", serverEnv().DOMAIN_VALIDATION_SECRET_KEY).update(PURPOSE + profileId).digest("base64url");
}

export function isValidUnsubscribeToken(profileId: string, token: string): boolean {
    const expected = Buffer.from(unsubscribeToken(profileId));
    const actual = Buffer.from(token);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Parses and checks a link's query; the member's id when it's genuine. */
export function verifyUnsubscribeParams(input: unknown): string | null {
    const parsed = unsubscribeParamsSchema.safeParse(input);
    if (!parsed.success) return null;
    return isValidUnsubscribeToken(parsed.data.m, parsed.data.t) ? parsed.data.m : null;
}

/** `page` goes in the email footer; `oneClick` is what mail clients POST to (List-Unsubscribe). */
export function unsubscribeUrls(profileId: string): { page: string; oneClick: string } {
    const query = new URLSearchParams({ m: profileId, t: unsubscribeToken(profileId) }).toString();
    return { page: siteUrl(`/unsubscribe?${query}`), oneClick: siteUrl(`/api/email/unsubscribe?${query}`) };
}

/** Saves the member's choice. Caller must have checked the link or the session. */
export async function setEmailSubscription(profileId: string, subscribed: boolean): Promise<boolean> {
    const { error } = await createAdminClient()
        .from("email_preference")
        .upsert(
            { profile_id: profileId, unsubscribed_at: subscribed ? null : new Date().toISOString(), updated_at: new Date().toISOString() },
            { onConflict: "profile_id" }
        );
    // 23503: the account was deleted, so there's no one left to email
    if (error?.code === "23503") return true;
    if (error) console.error("[email] Failed to save subscription:", error.message);
    return !error;
}

export async function isSubscribed(profileId: string): Promise<boolean> {
    const { data, error } = await createAdminClient()
        .from("email_preference")
        .select("unsubscribed_at")
        .eq("profile_id", profileId)
        .maybeSingle<{ unsubscribed_at: string | null }>();
    if (error) throw new Error(error.message);
    return !data?.unsubscribed_at;
}
