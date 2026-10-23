import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { siteUrl, serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";

/** Who an unsubscribe link belongs to. */
export const unsubscribeParamsSchema = z.object({
    kind: z.enum(["member"]),
    id: z.uuid(),
    token: z.string().min(1).max(100),
});

export type UnsubscribeKind = z.infer<typeof unsubscribeParamsSchema>["kind"];

// Signed links instead of sign-in: unsubscribing must work in one click from the email.
// The prefix keeps these HMACs distinct from the TXT record values made with the same secret.
export function unsubscribeToken(kind: UnsubscribeKind, id: string): string {
    return createHmac("sha256", serverEnv().DOMAIN_VALIDATION_SECRET_KEY)
        .update(`unsubscribe:${kind}:${id}`)
        .digest("base64url");
}

export function isValidUnsubscribeToken(kind: UnsubscribeKind, id: string, token: string): boolean {
    const expected = Buffer.from(unsubscribeToken(kind, id));
    const actual = Buffer.from(token);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** `page` is the confirm page linked in the email body; `oneClick` is what mail clients POST to. */
export function unsubscribeUrls(kind: UnsubscribeKind, id: string): { page: string; oneClick: string } {
    const query = new URLSearchParams({ kind, id, token: unsubscribeToken(kind, id) }).toString();
    return { page: siteUrl(`/unsubscribe?${query}`), oneClick: siteUrl(`/api/unsubscribe?${query}`) };
}

/** Caller must have checked the token. Returns whether the opt-out was saved. */
export async function recordUnsubscribe(kind: UnsubscribeKind, id: string): Promise<boolean> {
    const { error } = await createAdminClient()
        .from("member_email_pref")
        .upsert({ profile_id: id, opted_out: true }, { onConflict: "profile_id" });
    if (error) console.error(`[unsubscribe] Failed to save opt-out (${kind}):`, error.message);
    return !error;
}
