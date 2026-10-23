import "server-only";
import { serverEnv } from "@/lib/env";

export type EmailMessage = {
    to: string;
    subject: string;
    html: string;
    text: string;
    /** One-click unsubscribe endpoint (RFC 8058); Gmail and Yahoo require it for bulk mail. */
    oneClickUnsubscribeUrl: string;
    /** Resend drops a repeat of the same key within 24h, so a retried send can't deliver twice. */
    idempotencyKey: string;
};

/**
 * `retryable`: not delivered, for a reason that may clear (no key yet, auth, rate limit): retry later.
 * `permanent`: not delivered and never will be (e.g. 422 invalid recipient): don't retry.
 * `unknown`: a timeout, network error or 5xx; it may have been delivered, so never retry.
 */
export type SendOutcome = "sent" | "retryable" | "permanent" | "unknown";

const RETRYABLE_STATUSES = new Set([401, 403, 429]);

/** Sends through Resend's HTTP API. Never throws: callers decide what a failed send means. */
export async function sendEmail(message: EmailMessage): Promise<SendOutcome> {
    const env = serverEnv();
    if (!env.RESEND_API_KEY) return "retryable";

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                authorization: `Bearer ${env.RESEND_API_KEY}`,
                "content-type": "application/json",
                "idempotency-key": message.idempotencyKey,
            },
            body: JSON.stringify({
                from: env.EMAIL_FROM,
                to: [message.to],
                subject: message.subject,
                html: message.html,
                text: message.text,
                headers: {
                    "List-Unsubscribe": `<${message.oneClickUnsubscribeUrl}>`,
                    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                },
            }),
            signal: AbortSignal.timeout(8_000),
        });
        if (response.ok) return "sent";
        // Only the error name: Resend's messages can quote the recipient's address
        const { name } = (await response.json().catch(() => ({}))) as { name?: string };
        console.error("[email] Resend refused a message:", response.status, name ?? "");
        if (response.status >= 500) return "unknown";
        return RETRYABLE_STATUSES.has(response.status) ? "retryable" : "permanent";
    } catch (error) {
        console.error("[email] Resend request failed:", error instanceof Error ? error.name : "unknown error");
        return "unknown";
    }
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Member-supplied text (names, taglines) goes into email HTML; escape it. */
export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
