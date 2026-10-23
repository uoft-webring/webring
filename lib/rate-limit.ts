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
    // Guessing across many accounts at once. Every code entry counts, so it sits above the send
    // limit for a campus NAT. No site-wide cap: a few clients could fill it and lock everyone out.
    otpVerifyPerIp: { name: "otp-verify:ip", max: 150, windowSeconds: 15 * 60 },
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

/**
 * The client from the first hop of `x-forwarded-for` (Vercel sets it to the real address): an IPv4
 * address, or an IPv6 /64, since one user usually controls a whole /64.
 */
export function clientIpFrom(forwardedFor: string | null): string | null {
    const ip = forwardedFor?.split(",")[0]?.trim().toLowerCase();
    if (!ip) return null;
    if (!ip.includes(":")) return ip;
    const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return mapped[1];
    const [head, tail] = ip.split("::");
    const headParts = head ? head.split(":") : [];
    const tailParts = tail ? tail.split(":") : [];
    const groups = [...headParts, ...Array(Math.max(0, 8 - headParts.length - tailParts.length)).fill("0"), ...tailParts];
    return `${groups
        .slice(0, 4)
        .map((group) => group.replace(/^0+(?=.)/, ""))
        .join(":")}::/64`;
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

/** Limits on guessing a code: per client first (so a blocked client can't burn accounts' budgets), then per account. */
export async function allowOtpVerify(email: string): Promise<boolean> {
    const ip = await clientIp();
    if (ip && !(await consumeRateLimit(AUTH_LIMITS.otpVerifyPerIp, ip))) return false;
    return consumeRateLimit(AUTH_LIMITS.otpVerifyPerEmail, inboxKey(email));
}
