import { escapeHtml } from "@/lib/email";
import { isLinkableDomain } from "@/lib/profiles/ring";
import type { RingStatus } from "@/lib/profiles/types";

/** Members claimed per run. Resend's free plan allows 100 emails a day, invites included. */
export const REMINDER_BATCH_SIZE = 50;

export type ReminderRecipient = {
    name: string;
    domain: string;
    tagline: string;
    imageKey: string;
    tags: string[];
    ringStatus: RingStatus;
};

export type ReminderLinks = { edit: string; profile: string | null; unsubscribe: string };

/** What's still missing from a profile, most important first. Empty means it's complete. */
export function missingProfileItems(recipient: ReminderRecipient): string[] {
    const missing: string[] = [];
    if (!isLinkableDomain(recipient.domain)) {
        missing.push("Add your website so you show up in the ring");
    } else if (recipient.ringStatus !== "connected") {
        missing.push("Add the ring's prev/next links to your site");
    }
    if (!recipient.tagline) missing.push("Write a one-line tagline");
    if (!recipient.imageKey) missing.push("Upload a profile photo");
    if (recipient.tags.length === 0) missing.push("Pick up to 3 tags so people can find you");
    return missing;
}

export function reminderEmail(
    recipient: ReminderRecipient,
    links: ReminderLinks
): { subject: string; text: string; html: string } {
    const missing = missingProfileItems(recipient);
    const firstName = recipient.name.trim().split(/\s+/)[0] || "there";

    const subject = missing.length > 0 ? "Finish your UofT Webring profile" : "Is your UofT Webring profile still up to date?";
    const intro =
        missing.length > 0
            ? "A few things would make your UofT Webring profile complete:"
            : "It's been a while, so here's a quick check-in: is your UofT Webring profile still up to date? New projects, a new site, a new program?";
    const footer =
        "You're getting this because you're a member of the UofT Webring. We send this at most once every 8 months.";

    const text = [
        `Hi ${firstName},`,
        "",
        intro,
        ...missing.map((item) => `- ${item}`),
        "",
        `Update your profile: ${links.edit}`,
        ...(links.profile ? [`Your page: ${links.profile}`] : []),
        "",
        footer,
        `Unsubscribe: ${links.unsubscribe}`,
    ].join("\n");

    const html = `<p>Hi ${escapeHtml(firstName)},</p>
<p>${escapeHtml(intro)}</p>
${missing.length > 0 ? `<ul>${missing.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
<p><a href="${escapeHtml(links.edit)}">Update your profile</a>${
        links.profile ? ` · <a href="${escapeHtml(links.profile)}">Your page</a>` : ""
    }</p>
<p style="color:#666;font-size:12px">${escapeHtml(footer)} <a href="${escapeHtml(links.unsubscribe)}">Unsubscribe</a></p>`;

    return { subject, text, html };
}
