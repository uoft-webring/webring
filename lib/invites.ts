import { z } from "zod";
import { escapeHtml } from "@/lib/email";
import { displayDomain } from "@/lib/site";

/** Invites per run; shares Resend's free 100 a day with the 50 reminders. */
export const INVITE_BATCH_SIZE = 25;

/** The GitHub search is loose, so the server re-checks that the bio actually mentions UofT. */
export function mentionsUofT(bio: string): boolean {
    return /\b(university of toronto|uoft|u of t|utoronto|utsc|utm)\b/i.test(bio);
}

function withScheme(url: string): string {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** What the discovery Action posts per GitHub user. */
export const inviteCandidateSchema = z.object({
    githubLogin: z.string().regex(/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/),
    name: z.string().trim().max(80).nullable(),
    email: z.email().max(254).transform((email) => email.toLowerCase()),
    // GitHub lets people write "jane.dev" without a scheme
    website: z
        .string()
        .trim()
        .min(1)
        .max(255)
        .transform(withScheme)
        .pipe(z.url({ protocol: /^https?$/ })),
    bio: z.string().max(500).refine(mentionsUofT, "Bio doesn't mention UofT"),
});

export const inviteCandidatesSchema = z.array(z.unknown()).max(1000);

export type InviteCandidate = z.infer<typeof inviteCandidateSchema>;

/** "https://www.Jane.dev/blog" -> "jane.dev", to spot people who are already in the ring. */
export function siteKey(url: string): string | null {
    try {
        return new URL(withScheme(url.trim())).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
        return null;
    }
}

export function inviteEmail(
    candidate: { name: string | null; website: string },
    links: { join: string; site: string; unsubscribe: string }
): { subject: string; text: string; html: string } {
    const firstName = candidate.name?.trim().split(/\s+/)[0] || "there";
    const subject = "Your site belongs on the UofT Webring";
    const pitch = `The UofT Webring links University of Toronto students' personal sites together, so visitors can hop from one to the next. We came across ${displayDomain(candidate.website)} through your GitHub profile and thought it would fit right in.`;
    const how = "Joining takes a couple of minutes: sign up with your UofT email, add your site, and you're in.";
    const footer =
        "We found your email on your public GitHub profile. This is the only email we'll send you unless you join.";

    const text = [
        `Hi ${firstName},`,
        "",
        pitch,
        "",
        how,
        `Join: ${links.join}`,
        `See the ring: ${links.site}`,
        "",
        footer,
        `Unsubscribe: ${links.unsubscribe}`,
    ].join("\n");

    const html = `<p>Hi ${escapeHtml(firstName)},</p>
<p>${escapeHtml(pitch)}</p>
<p>${escapeHtml(how)}</p>
<p><a href="${escapeHtml(links.join)}">Join the ring</a> · <a href="${escapeHtml(links.site)}">See the ring</a></p>
<p style="color:#666;font-size:12px">${escapeHtml(footer)} <a href="${escapeHtml(links.unsubscribe)}">Unsubscribe</a></p>`;

    return { subject, text, html };
}
