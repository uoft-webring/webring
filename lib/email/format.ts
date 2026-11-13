// Turns an admin's email (plain text with light formatting and {{merge_fields}}) into the subject, HTML
// and text parts for one member. Pure, so the composer previews with exactly what gets sent.
//
// Formatting: blank lines separate paragraphs, lines starting with "- " make a list, **bold**,
// [text](https://link) and bare https:// links. Nothing else is interpreted.
import { displayDomain, profileUrl, SITE_ORIGIN } from "@/lib/site";

// Mirror the email_campaign check constraints
export const MAX_SUBJECT_LENGTH = 200;
export const MAX_BODY_LENGTH = 20_000;

/** What a merge field can read about a recipient. */
export type EmailRecipient = {
    name: string;
    ringId: number;
    slug: string;
    domain: string;
};

type FieldKind = "text" | "url";

type MergeField = { kind: FieldKind; description: string; value: (recipient: EmailRecipient) => string };

export const MERGE_FIELDS = {
    first_name: {
        kind: "text",
        description: "First word of their name, or “there”",
        value: (recipient) => recipient.name.trim().split(/\s+/)[0] || "there",
    },
    name: { kind: "text", description: "Full name, or “there”", value: (recipient) => recipient.name.trim() || "there" },
    site: {
        kind: "text",
        description: "Their site, e.g. jane.dev, or “your site”",
        value: (recipient) => (recipient.domain ? displayDomain(recipient.domain) : "your site"),
    },
    ring_id: { kind: "text", description: "Their ring id", value: (recipient) => String(recipient.ringId) },
    profile_url: {
        kind: "url",
        description: "Their page on the webring",
        value: (recipient) => (recipient.slug ? profileUrl(recipient.slug) : `${SITE_ORIGIN}/directory`),
    },
    dashboard_url: { kind: "url", description: "Their dashboard", value: () => `${SITE_ORIGIN}/dashboard` },
    join_url: { kind: "url", description: "Where they add the ring widget", value: () => `${SITE_ORIGIN}/dashboard/join` },
} satisfies Record<string, MergeField>;

export type MergeFieldName = keyof typeof MERGE_FIELDS;

const FIELD = /\{\{\s*([a-z_]+)\s*\}\}/g;

function field(name: string): MergeField | undefined {
    return Object.hasOwn(MERGE_FIELDS, name) ? MERGE_FIELDS[name as MergeFieldName] : undefined;
}

// Looser than FIELD on purpose: {{First_Name}} or {{first-name}} would otherwise slip past
// the check and go out to every member as literal text.
const ANY_FIELD = /\{\{\s*([^{}]*?)\s*\}\}/g;

/** Merge fields in `template` that don't exist, e.g. a typo like {{frist_name}} or {{First_Name}}. */
export function unknownMergeFields(template: string): string[] {
    const unknown = new Set<string>();
    for (const [, name] of template.matchAll(ANY_FIELD)) if (!field(name)) unknown.add(name);
    return [...unknown];
}

export function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

/** Replaces merge fields with plain values (subjects and text parts). Unknown fields stay as written. */
function mergeText(template: string, recipient: EmailRecipient): string {
    return template.replace(FIELD, (raw, name: string) => field(name)?.value(recipient) ?? raw);
}

const LINK_STYLE = "color:#1d4ed8;text-decoration:underline";

function anchor(href: string, label: string): string {
    return `<a href="${escapeHtml(href)}" style="${LINK_STYLE}">${label}</a>`;
}

// One pass over a line, so a member's name can never be read as formatting: values are substituted
// after the admin's markup is parsed, and always escaped.
const INLINE =
    /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|\{\{\s*[a-z_]+\s*\}\})\)|\*\*([^*\n]+)\*\*|\{\{\s*([a-z_]+)\s*\}\}|(https?:\/\/[^\s<>]*[^\s<>.,;:!?)\]'"])/g;

function resolveHref(target: string, recipient: EmailRecipient): string | null {
    const named = /^\{\{\s*([a-z_]+)\s*\}\}$/.exec(target);
    if (!named) return target;
    const merge = field(named[1]);
    return merge?.kind === "url" ? merge.value(recipient) : null;
}

function inlineHtml(line: string, recipient: EmailRecipient): string {
    let html = "";
    let last = 0;
    for (const match of line.matchAll(INLINE)) {
        html += escapeHtml(line.slice(last, match.index));
        last = match.index + match[0].length;
        const [raw, linkText, linkTarget, bold, fieldName, bareUrl] = match;
        if (linkText !== undefined) {
            const href = resolveHref(linkTarget, recipient);
            const label = escapeHtml(mergeText(linkText, recipient));
            html += href ? anchor(href, label) : escapeHtml(raw);
        } else if (bold !== undefined) {
            html += `<strong>${escapeHtml(mergeText(bold, recipient))}</strong>`;
        } else if (fieldName !== undefined) {
            const merge = field(fieldName);
            if (!merge) html += escapeHtml(raw);
            else if (merge.kind === "url") html += anchor(merge.value(recipient), escapeHtml(merge.value(recipient)));
            else html += escapeHtml(merge.value(recipient));
        } else {
            html += anchor(bareUrl, escapeHtml(bareUrl));
        }
    }
    return html + escapeHtml(line.slice(last));
}

function inlineText(line: string, recipient: EmailRecipient): string {
    return line.replace(INLINE, (raw, linkText?: string, linkTarget?: string, bold?: string) => {
        if (linkText !== undefined && linkTarget !== undefined) {
            const href = resolveHref(linkTarget, recipient);
            const label = mergeText(linkText, recipient);
            return href ? `${label} (${href})` : raw;
        }
        if (bold !== undefined) return mergeText(bold, recipient);
        return mergeText(raw, recipient);
    });
}

type Block = { kind: "paragraph"; lines: string[] } | { kind: "list"; items: string[] };

function blocks(body: string): Block[] {
    return body
        .replace(/\r\n?/g, "\n")
        .split(/\n\s*\n/)
        .map((chunk) => chunk.split("\n").map((line) => line.trimEnd()))
        .filter((lines) => lines.some((line) => line.trim() !== ""))
        .map((lines): Block =>
            lines.every((line) => /^\s*- /.test(line))
                ? { kind: "list", items: lines.map((line) => line.replace(/^\s*- /, "")) }
                : { kind: "paragraph", lines }
        );
}

export type EmailContent = { subject: string; body: string };

export type RenderedEmail = { subject: string; html: string; text: string };

export type EmailFooter = {
    /** The member's personal unsubscribe page. */
    unsubscribeUrl: string;
    postalAddress?: string;
};

const P_STYLE = "margin:0 0 16px;line-height:1.6";

/** The finished email for one recipient. */
export function renderEmail(content: EmailContent, recipient: EmailRecipient, footer: EmailFooter): RenderedEmail {
    const parsed = blocks(content.body);

    const bodyHtml = parsed
        .map((block) =>
            block.kind === "list"
                ? `<ul style="margin:0 0 16px;padding-left:20px;line-height:1.6">${block.items
                      .map((item) => `<li>${inlineHtml(item, recipient)}</li>`)
                      .join("")}</ul>`
                : `<p style="${P_STYLE}">${block.lines.map((line) => inlineHtml(line, recipient)).join("<br>")}</p>`
        )
        .join("\n");
    const bodyText = parsed
        .map((block) =>
            block.kind === "list"
                ? block.items.map((item) => `- ${inlineText(item, recipient)}`).join("\n")
                : block.lines.map((line) => inlineText(line, recipient)).join("\n")
        )
        .join("\n\n");

    const why = "You're getting this because you're a member of the UofT Webring.";
    const address = footer.postalAddress?.trim();
    const footerHtml = [
        `${escapeHtml(why)} ${anchor(footer.unsubscribeUrl, "Unsubscribe")} from these emails.`,
        `UofT Webring · ${anchor(SITE_ORIGIN, "uoftwebring.com")}${address ? ` · ${escapeHtml(address)}` : ""}`,
    ]
        .map((line) => `<p style="margin:0 0 8px">${line}</p>`)
        .join("");

    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(
        mergeText(content.subject, recipient)
    )}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;color:#18181b">
<div style="background:#ffffff;border-radius:12px;padding:28px 24px">
${bodyHtml}
</div>
<div style="padding:16px 4px 0;font-size:13px;color:#71717a;line-height:1.5">${footerHtml}</div>
</div>
</body></html>`;

    const text = `${bodyText}\n\n--\n${why}\nUnsubscribe: ${footer.unsubscribeUrl}\nUofT Webring · ${SITE_ORIGIN}${
        address ? ` · ${address}` : ""
    }\n`;

    return { subject: mergeText(content.subject, recipient).replace(/\s+/g, " ").trim(), html, text };
}
