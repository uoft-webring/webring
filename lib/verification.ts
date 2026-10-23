import "server-only";
import { createHmac } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { serverEnv } from "@/lib/env";
import { safeFetch } from "@/lib/url-safety";

/**
 * Two separate checks:
 * - Ring link (`validated_user_component`): the member's site embeds the prev/next widget.
 * - Domain verification (`is_verified`): the member controls the domain, shown by a DNS TXT record
 *   or, for hosts without DNS access (e.g. GitHub Pages), a meta tag on the page itself.
 */

export const TXT_RECORD_NAME = "uoft-webring";

/** Deterministic per member, but only we can generate it, so it can't be spoofed. */
export function txtRecordValue(ringId: number): string {
    return createHmac("sha256", serverEnv().DOMAIN_VALIDATION_SECRET_KEY).update(String(ringId)).digest("base64url");
}

export async function hasVerificationRecord(domain: string, ringId: number): Promise<boolean> {
    let hostname: string;
    try {
        hostname = new URL(domain).hostname;
    } catch {
        return false;
    }

    try {
        const records = await resolveTxt(`${TXT_RECORD_NAME}.${hostname}`);
        return records.map((parts) => parts.join("")).includes(txtRecordValue(ringId));
    } catch {
        // ENOTFOUND / ENODATA: no record yet
        return false;
    }
}

// Opening tags, with quoted attribute values consumed whole so a `<meta` inside one isn't a tag
const TAG = /<([a-zA-Z][^\s/>]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
// Attribute names per the HTML tokenizer: anything up to whitespace, quotes, `>`, `/` or `=`
const ATTRIBUTE = /([^\s"'>\/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
// Text a browser never parses as tags: a <meta> inside these isn't a real meta element
const INERT = /<!--[\s\S]*?-->|<(script|style|textarea|title|template|noscript|xmp)\b[\s\S]*?<\/\1\s*>/gi;
// Any other element ends the head, as it does in a browser
const HEAD_ELEMENTS = new Set(["html", "head", "meta", "link", "base", "title", "style", "script", "noscript", "template"]);

/** Attributes of each <meta> in the document's real head, in order. */
function* headMetaTags(html: string): Generator<Map<string, string>> {
    const cleaned = html.replace(INERT, "");
    const headEnd = cleaned.search(/<\/head\s*>/i);
    for (const [, tagName, rawAttributes] of (headEnd === -1 ? cleaned : cleaned.slice(0, headEnd)).matchAll(TAG)) {
        const name = tagName.toLowerCase();
        if (!HEAD_ELEMENTS.has(name)) return;
        if (name !== "meta") continue;
        const attributes = new Map<string, string>();
        for (const match of rawAttributes.matchAll(ATTRIBUTE)) {
            const key = match[1].toLowerCase();
            // Browsers keep the first of duplicate attributes
            if (!attributes.has(key)) attributes.set(key, (match[2] ?? match[3] ?? match[4]).trim());
        }
        yield attributes;
    }
}

/** Whether `html`'s head has `<meta name="uoft-webring" content="…">` with `value`, attributes in any order. */
export function hasVerificationMetaTag(html: string, value: string): boolean {
    for (const attributes of headMetaTags(html)) {
        if (attributes.get("name")?.toLowerCase() === TXT_RECORD_NAME && attributes.get("content") === value) {
            return true;
        }
    }
    return false;
}

function sameSite(a: URL, b: URL): boolean {
    const host = (url: URL) => url.hostname.replace(/^www\./, "");
    return host(a) === host(b);
}

/**
 * Checks the site's homepage, not the stored URL: a member could otherwise point their domain at
 * someone else's page that echoes a query string (a search page, a JSON API) and verify with it.
 */
export async function hasVerificationMeta(domain: string, ringId: number): Promise<boolean> {
    let homepage: URL;
    try {
        homepage = new URL("/", domain);
    } catch {
        return false;
    }
    // The tag belongs in <head>, so the first 1MB is plenty
    const response = await safeFetch(homepage.toString(), { method: "GET", timeoutMs: 8000, maxBytes: 1024 * 1024 });
    if (!response?.ok || !response.contentType.toLowerCase().startsWith("text/html")) return false;
    // Redirects are fine within the site (http→https, www), but an open redirect elsewhere must not
    // let someone verify a domain by pointing it at a page they control
    if (!sameSite(homepage, new URL(response.url))) return false;
    return hasVerificationMetaTag(response.body.toString("utf8"), txtRecordValue(ringId));
}

/** Either proof of control is enough. DNS first: it's quick, and a match skips fetching the site. */
export async function hasDomainOwnershipProof(domain: string, ringId: number): Promise<boolean> {
    if (await hasVerificationRecord(domain, ringId)) return true;
    return hasVerificationMeta(domain, ringId).catch(() => false);
}

export async function isUrlReachable(url: string): Promise<boolean> {
    // Real sites chain http→https→www→trailing slash→locale; main accepted any redirect, so allow plenty
    const head = await safeFetch(url, { method: "HEAD", maxRedirects: 8 });
    if (head && head.status < 400) return true;
    // Plenty of servers answer HEAD with 405 or 404 but serve GET fine
    const get = await safeFetch(url, { method: "GET", maxRedirects: 8 });
    return get !== null && get.status < 400;
}

const WIDGET_LINK = /uoftwebring\.com\/redirect\?([^"'\s<>`]*)/gi;

/** Whether `html` links to both the previous and next member from `ringId`. */
export function hasRingWidget(html: string, ringId: number): boolean {
    const found = new Set<string>();
    for (const match of html.matchAll(WIDGET_LINK)) {
        const params = new URLSearchParams(match[1].replaceAll("&amp;", "&"));
        const nav = params.get("nav");
        if ((nav === "prev" || nav === "next") && params.get("id") === String(ringId)) found.add(nav);
    }
    return found.has("prev") && found.has("next");
}

export type WidgetCheck = "found" | "missing" | "unreachable";

export async function checkRingWidget(domain: string, ringId: number): Promise<WidgetCheck> {
    // The widget belongs in the static HTML; scanning past the first 2MB isn't worth it
    const response = await safeFetch(domain, { method: "GET", timeoutMs: 8000, maxBytes: 2 * 1024 * 1024 });
    if (!response || !response.ok) return "unreachable";
    return hasRingWidget(response.body.toString("utf8"), ringId) ? "found" : "missing";
}
