import "server-only";
import { serverEnv } from "@/lib/env";
import { fail, ok, type Result } from "@/lib/result";

export type EmailMessage = {
    to: string;
    subject: string;
    html: string;
    text: string;
    /** One-click unsubscribe endpoint (RFC 8058); Gmail and Yahoo require it for bulk mail. */
    oneClickUnsubscribeUrl: string;
};

/** Sends through Resend's HTTP API. Never throws: callers decide what a failed send means. */
export async function sendEmail(message: EmailMessage): Promise<Result<null>> {
    const env = serverEnv();
    if (!env.RESEND_API_KEY) return fail("Email is not configured.");

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
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
            signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) {
            console.error("[email] Resend rejected a message:", response.status, await response.text().catch(() => ""));
            return fail("Could not send the email.");
        }
        return ok(null);
    } catch (error) {
        console.error("[email] Resend request failed:", error);
        return fail("Could not send the email.");
    }
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Member-supplied text (names, taglines) goes into email HTML; escape it. */
export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
