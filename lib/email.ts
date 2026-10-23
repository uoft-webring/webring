import "server-only";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { serverEnv } from "@/lib/env";

export type EmailMessage = {
    to: string;
    subject: string;
    html: string;
    text: string;
    /** One-click unsubscribe endpoint (RFC 8058); Gmail and Yahoo require it for bulk mail. */
    oneClickUnsubscribeUrl: string;
};

/**
 * `retryable`: not delivered, for a reason that may clear (throttling, credentials, SES sandbox or
 * paused sending): retry later.
 * `permanent`: not delivered and never will be (e.g. a malformed address): don't retry.
 * `unknown`: a timeout, network error or 5xx; it may have been delivered, so never retry.
 */
export type SendOutcome = "sent" | "retryable" | "permanent" | "unknown";

// SES refusals that say nothing about the message itself. MessageRejected is here because the SES
// sandbox uses it for "recipient not verified", which clears once production access is granted.
const RETRYABLE_ERRORS = new Set([
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
export function classifySendError(error: unknown): Exclude<SendOutcome, "sent"> {
    const name = error instanceof Error ? error.name : "";
    if (RETRYABLE_ERRORS.has(name)) return "retryable";
    const status = (error as { $metadata?: { httpStatusCode?: number } } | null)?.$metadata?.httpStatusCode;
    return status !== undefined && status < 500 ? "permanent" : "unknown";
}

let client: SESv2Client | undefined;

function ses(): SESv2Client {
    const env = serverEnv();
    client ??= new SESv2Client({
        region: env.AWS_SES_REGION ?? env.AWS_REGION,
        credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY },
        // The SDK retries timeouts and 5xx by default, which could deliver a message twice
        maxAttempts: 1,
    });
    return client;
}

/** Sends through Amazon SES. Never throws: callers decide what a failed send means. */
export async function sendEmail(message: EmailMessage): Promise<SendOutcome> {
    try {
        await ses().send(
            new SendEmailCommand({
                FromEmailAddress: serverEnv().EMAIL_FROM,
                Destination: { ToAddresses: [message.to] },
                Content: {
                    Simple: {
                        Subject: { Data: message.subject, Charset: "UTF-8" },
                        Body: { Html: { Data: message.html, Charset: "UTF-8" }, Text: { Data: message.text, Charset: "UTF-8" } },
                        Headers: [
                            { Name: "List-Unsubscribe", Value: `<${message.oneClickUnsubscribeUrl}>` },
                            { Name: "List-Unsubscribe-Post", Value: "List-Unsubscribe=One-Click" },
                        ],
                    },
                },
            }),
            { abortSignal: AbortSignal.timeout(8_000) }
        );
        return "sent";
    } catch (error) {
        // Only the error name: SES messages can quote the recipient's address
        console.error("[email] SES send failed:", error instanceof Error ? error.name : "unknown error");
        return classifySendError(error);
    }
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Member-supplied text (names, taglines) goes into email HTML; escape it. */
export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
