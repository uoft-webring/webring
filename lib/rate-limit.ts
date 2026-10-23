import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

export type RateLimit = { name: string; max: number; windowSeconds: number };

// Supabase's own per-IP auth limits see every request as coming from our server, so they can't
// tell one attacker from all our users; these limits key on what the server knows instead.
export const AUTH_LIMITS = {
    // Codes emailed to one address, across sign-up, sign-in and resend
    otpSendPerEmail: { name: "otp-send:email", max: 5, windowSeconds: 60 * 60 },
    // Stops one client spraying codes at many addresses (or probing which are registered). High
    // enough for a lecture hall signing up together behind one campus NAT.
    otpSendPerIp: { name: "otp-send:ip", max: 100, windowSeconds: 60 * 60 },
    // A 6-digit code has a million values; 10 guesses per 15 minutes per account makes brute force hopeless
    otpVerifyPerEmail: { name: "otp-verify:email", max: 10, windowSeconds: 15 * 60 },
    // Guessing across many accounts at once: cap it per client and site-wide
    otpVerifyPerIp: { name: "otp-verify:ip", max: 30, windowSeconds: 15 * 60 },
    otpVerifyGlobal: { name: "otp-verify:all", max: 600, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimit>;

/** `alice+anything@x` reaches alice@x's inbox, so they share one budget. */
export function inboxKey(email: string): string {
    const [local, domain] = email.trim().toLowerCase().split("@");
    return `${local.split("+")[0]}@${domain}`;
}

/** Hashed so the table never holds emails or IPs. */
export function bucketKey(limit: RateLimit, subject: string): string {
    const digest = createHash("sha256").update(subject.trim().toLowerCase()).digest("hex");
    return `${limit.name}:${digest}`;
}

/** First hop of `x-forwarded-for`, which Vercel sets to the real client address. */
export function clientIpFrom(forwardedFor: string | null): string | null {
    return forwardedFor?.split(",")[0]?.trim() || null;
}

/** Counts one hit against `limit` for `subject`; false once the subject is over the limit. */
export async function consumeRateLimit(limit: RateLimit, subject: string): Promise<boolean> {
    const { data, error } = await createAdminClient().rpc("consume_rate_limit", {
        bucket: bucketKey(limit, subject),
        max_hits: limit.max,
        window_seconds: limit.windowSeconds,
    });
    if (error) {
        // Fail open: a limiter outage shouldn't lock everyone out, and Supabase still caps emails
        console.error("[rate-limit] consume_rate_limit failed:", error.code, error.message);
        return true;
    }
    return data === true;
}

async function clientIp(): Promise<string | null> {
    return clientIpFrom((await headers()).get("x-forwarded-for"));
}

/**
 * Per-client, then per-inbox limits on emailing an OTP. The client is checked first so a blocked
 * client can't keep spending (and so lock out) other people's per-inbox budgets.
 */
export async function allowOtpSend(email: string): Promise<"ok" | "inbox" | "client"> {
    const ip = await clientIp();
    if (ip && !(await consumeRateLimit(AUTH_LIMITS.otpSendPerIp, ip))) return "client";
    return (await consumeRateLimit(AUTH_LIMITS.otpSendPerEmail, inboxKey(email))) ? "ok" : "inbox";
}

/** Limits on guessing a code: per client and per account, then a site-wide ceiling. */
export async function allowOtpVerify(email: string): Promise<boolean> {
    const ip = await clientIp();
    if (ip && !(await consumeRateLimit(AUTH_LIMITS.otpVerifyPerIp, ip))) return false;
    if (!(await consumeRateLimit(AUTH_LIMITS.otpVerifyPerEmail, inboxKey(email)))) return false;
    return consumeRateLimit(AUTH_LIMITS.otpVerifyGlobal, "all");
}
