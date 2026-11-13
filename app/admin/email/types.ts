import type { AudienceMember } from "@/lib/email/audience";
import type { EmailRecipient } from "@/lib/email/format";

export const STATUS_LABEL = { draft: "Draft", sending: "Sending", sent: "Sent" } as const;

/**
 * What the composer knows about each member: enough to count an audience and preview merge fields
 * in the browser without a server call per change. Never their email address.
 */
export type ComposerMember = AudienceMember & {
    recipient: EmailRecipient;
    /** Subscribed with a usable address: would actually get the email. */
    reachable: boolean;
    unsubscribed: boolean;
};
