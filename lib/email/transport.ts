import "server-only";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { serverEnv } from "@/lib/env";

export type OutgoingEmail = {
    to: string;
    subject: string;
    html: string;
    text: string;
    /** One-click unsubscribe endpoint (RFC 8058). Gmail and Yahoo require it from bulk senders. */
    oneClickUnsubscribeUrl: string;
};

/**
 * sent: the provider accepted it.
 * failed: not delivered, for a reason that may clear (throttling, credentials, SES sandbox): retry later.
 * rejected: not delivered and never will be (e.g. a malformed address).
 * unknown: a timeout, network error or 5xx. It may have been delivered, so it's never retried for you.
 */
export type SendResult =
    | { outcome: "sent"; messageId: string | null }
    | { outcome: "failed" | "rejected" | "unknown"; error: string };

export type EmailTransport = (email: OutgoingEmail) => Promise<SendResult>;

const SEND_TIMEOUT_MS = 10_000;

// SES refusals that say nothing about the message. MessageRejected is here because the SES sandbox
// uses it for "recipient not verified", which clears once production access is granted.
const RETRYABLE_SES_ERRORS = new Set([
    "TooManyRequestsException",
    "LimitExceededException",
    "ThrottlingException",
    "SendingPausedException",
    "AccountSuspendedException",
    "MailFromDomainNotVerifiedException",
    "MessageRejected",
    "AccessDeniedException",
    "UnrecognizedClientException",
    "InvalidClientTokenId",
    "ExpiredTokenException",
    "SignatureDoesNotMatch",
]);

/** What a failed SES call means for retrying. Exported for tests. */
export function classifySesError(error: unknown): Exclude<SendResult["outcome"], "sent"> {
    const name = error instanceof Error ? error.name : "";
    if (RETRYABLE_SES_ERRORS.has(name)) return "failed";
    const status = (error as { $metadata?: { httpStatusCode?: number } } | null)?.$metadata?.httpStatusCode;
    return status !== undefined && status < 500 ? "rejected" : "unknown";
}

/** Splits `Name <email@x>` (or a bare address) for providers that want them apart. */
export function parseAddress(value: string): { name: string; email: string } {
    const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(value);
    return match ? { name: match[1].replace(/^"|"$/g, ""), email: match[2].trim() } : { name: "", email: value.trim() };
}

function errorText(error: unknown): string {
    return error instanceof Error ? `${error.name}: ${error.message}`.slice(0, 500) : "Unknown error";
}

let sesClient: SESv2Client | undefined;

function sesTransport(from: string, replyTo: string | undefined): EmailTransport {
    const env = serverEnv();
    sesClient ??= new SESv2Client({
        region: env.AWS_SES_REGION ?? env.AWS_REGION,
        credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY },
        // The SDK retries timeouts and 5xx by default, which could deliver a message twice
        maxAttempts: 1,
    });
    const client = sesClient;
    return async (email) => {
        try {
            const response = await client.send(
                new SendEmailCommand({
                    FromEmailAddress: from,
                    ReplyToAddresses: replyTo ? [replyTo] : undefined,
                    Destination: { ToAddresses: [email.to] },
                    Content: {
                        Simple: {
                            Subject: { Data: email.subject, Charset: "UTF-8" },
                            Body: {
                                Html: { Data: email.html, Charset: "UTF-8" },
                                Text: { Data: email.text, Charset: "UTF-8" },
                            },
                            Headers: [
                                { Name: "List-Unsubscribe", Value: `<${email.oneClickUnsubscribeUrl}>` },
                                { Name: "List-Unsubscribe-Post", Value: "List-Unsubscribe=One-Click" },
                            ],
                        },
                    },
                }),
                { abortSignal: AbortSignal.timeout(SEND_TIMEOUT_MS) }
            );
            return { outcome: "sent", messageId: response.MessageId ?? null };
        } catch (error) {
            return { outcome: classifySesError(error), error: errorText(error) };
        }
    };
}

// Mailpit's send API (https://mailpit.axllent.org/docs/api-v1/): local development only.
function mailpitTransport(from: string, replyTo: string | undefined, baseUrl: string): EmailTransport {
    return async (email) => {
        try {
            const response = await fetch(new URL("/api/v1/send", baseUrl), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    From: { Email: parseAddress(from).email, Name: parseAddress(from).name },
                    To: [{ Email: email.to }],
                    ReplyTo: replyTo ? [{ Email: parseAddress(replyTo).email }] : undefined,
                    Subject: email.subject,
                    HTML: email.html,
                    Text: email.text,
                    Headers: {
                        "List-Unsubscribe": `<${email.oneClickUnsubscribeUrl}>`,
                        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                    },
                }),
                signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
            });
            if (!response.ok) {
                const detail = (await response.text()).slice(0, 300);
                return { outcome: response.status < 500 ? "rejected" : "unknown", error: `Mailpit ${response.status}: ${detail}` };
            }
            const body = (await response.json()) as { ID?: string };
            return { outcome: "sent", messageId: body.ID ?? null };
        } catch (error) {
            return { outcome: "unknown", error: errorText(error) };
        }
    };
}

export type EmailConfig = { transport: EmailTransport; from: string; postalAddress?: string; provider: "ses" | "mailpit" };

/** The configured transport, or why sending is off (shown on /admin/email). */
export function emailConfig(): { config: EmailConfig; problem: null } | { config: null; problem: string } {
    const env = serverEnv();
    if (!env.EMAIL_TRANSPORT) return { config: null, problem: "Sending is off: EMAIL_TRANSPORT isn't set." };
    if (!env.EMAIL_FROM) return { config: null, problem: "Sending is off: EMAIL_FROM isn't set." };
    if (env.EMAIL_TRANSPORT === "mailpit" && env.VERCEL_ENV === "production")
        return { config: null, problem: "Sending is off: Mailpit is for local development only." };
    const transport =
        env.EMAIL_TRANSPORT === "ses"
            ? sesTransport(env.EMAIL_FROM, env.EMAIL_REPLY_TO)
            : mailpitTransport(env.EMAIL_FROM, env.EMAIL_REPLY_TO, env.MAILPIT_URL ?? "http://127.0.0.1:54624");
    return {
        config: { transport, from: env.EMAIL_FROM, postalAddress: env.EMAIL_POSTAL_ADDRESS, provider: env.EMAIL_TRANSPORT },
        problem: null,
    };
}
