import "server-only";
import { createHmac } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { serverEnv } from "@/lib/env";
import { SITE_ORIGIN } from "@/lib/site";
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
    return createHmac("sha256", serverEnv().DOMAIN_VALIDATION_SECRET_KEY)
        .update(String(ringId))
        .digest("base64url");
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

// These run on member-supplied HTML, so every pattern must stay linear: no two parts may be able to
// match the same characters (that backtracks catastrophically on hostile input).
// Opening tags, with quoted attribute values consumed whole so a `<meta` inside one isn't a tag
const TAG = /<([a-zA-Z][^\s/<>]*)((?:[^<>"']|"[^"]*"|'[^']*')*)>/g;
// TAG anchored at a given index, to read the opening tag of a raw-text element
const TAG_AT = new RegExp(TAG.source, "y");
// Attribute names per the HTML tokenizer, starting at a boundary: up to whitespace, quotes, `>`, `/` or `=`.
// The value is optional: boolean attributes such as `nomodule` have none
const ATTRIBUTE = /(?<![^\s"'>/=])([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
// Starts of text a browser never parses as tags: a <meta> inside these isn't a real meta element.
// The tag name ends where the tokenizer ends it (not at `\b`), so `<script-loader>` is a custom element
const INERT_START = /<!--|<(script|style|textarea|title|template|noscript|xmp)(?![^\s/>])/gi;
// Any other element ends the head, as it does in a browser
const HEAD_ELEMENTS = new Set([
    "html",
    "head",
    "meta",
    "link",
    "base",
    "title",
    "style",
    "script",
    "noscript",
    "template",
]);
// A head is never this big; it bounds the work on a hostile page
const MAX_SCAN = 256 * 1024;
const SITE_URL = new URL(SITE_ORIGIN);

// Case-insensitive indexOf. Searching a lowercased copy would drift: some characters (e.g. "İ")
// change length when lowercased, so its indices don't line up with the original
function indexOfIgnoreCase(haystack: string, needle: string, from: number): number {
    const pattern = new RegExp(needle.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"), "gi");
    pattern.lastIndex = from;
    return pattern.exec(haystack)?.index ?? -1;
}

/**
 * `html` without comments and raw-text elements, in one forward pass. An unclosed one runs to the end.
 * `onScript` gets the raw attributes of each live <script> opening tag (not ones inside comments,
 * <noscript>, <template> etc., which never run).
 */
function withoutInert(html: string, onScript?: (rawAttributes: string) => void): string {
    let kept = "";
    let position = 0;
    INERT_START.lastIndex = 0;
    for (let match = INERT_START.exec(html); match; match = INERT_START.exec(html)) {
        kept += html.slice(position, match.index);
        const closer = match[1] ? `</${match[1].toLowerCase()}` : "-->";
        const closeAt = indexOfIgnoreCase(html, closer, INERT_START.lastIndex);
        // A script left open at the end of the page never runs
        if (closeAt === -1) return kept;
        if (onScript && match[1]?.toLowerCase() === "script") {
            // Only up to the closer, so an unclosed quote can't send the tag scan past this element. The
            // slices never overlap, so the whole pass stays linear on a hostile 2MB page
            TAG_AT.lastIndex = 0;
            const open = TAG_AT.exec(html.slice(match.index, closeAt));
            if (open) onScript(open[2]);
        }
        position = match[1] ? html.indexOf(">", closeAt) + 1 || html.length : closeAt + closer.length;
        INERT_START.lastIndex = position;
    }
    return kept + html.slice(position);
}

/** A tag's attributes as a browser reads them: names lowercased, values as written, first duplicate wins. */
function parseAttributes(rawAttributes: string): Map<string, string> {
    const attributes = new Map<string, string>();
    for (const match of rawAttributes.matchAll(ATTRIBUTE)) {
        const key = match[1].toLowerCase();
        if (!attributes.has(key)) attributes.set(key, match[2] ?? match[3] ?? match[4] ?? "");
    }
    return attributes;
}

// The HTML spec's JavaScript MIME types: any other type (text/plain from cookie-consent tools,
// text/partytown, module, …) means the browser doesn't run the tag as a classic script
const JAVASCRIPT_TYPES = new Set([
    "application/ecmascript",
    "application/javascript",
    "application/x-ecmascript",
    "application/x-javascript",
    "text/ecmascript",
    "text/javascript",
    "text/javascript1.0",
    "text/javascript1.1",
    "text/javascript1.2",
    "text/javascript1.3",
    "text/javascript1.4",
    "text/javascript1.5",
    "text/jscript",
    "text/livescript",
    "text/x-ecmascript",
    "text/x-javascript",
]);

/** Whether a browser runs the tag as a classic script, the only kind with a document.currentScript. */
function runsAsClassicScript(attributes: Map<string, string>): boolean {
    // Browsers with module support skip nomodule scripts
    if (attributes.has("nomodule")) return false;
    const type = attributes.get("type");
    const language = attributes.get("language");
    // Per the spec, a legacy language attribute counts only when there's no type attribute
    const kind = type !== undefined ? type.trim() : language ? `text/${language}` : "";
    return kind === "" || JAVASCRIPT_TYPES.has(kind.toLowerCase());
}

/**
 * The ring id a live one-line widget tag (public/embed.js) renders links for, or null if it isn't one.
 * Same rules as embed.js: the whole data-id must be digits, and it must run as a classic script.
 */
function embedWidgetId(rawAttributes: string): number | null {
    const attributes = parseAttributes(rawAttributes);
    const id = attributes.get("data-id") ?? "";
    if (!/^\d{1,9}$/.test(id) || !runsAsClassicScript(attributes)) return null;
    try {
        // A relative src resolves against the member's own site, never ours
        const src = new URL(attributes.get("src")?.trim() ?? "", "https://member-site.invalid");
        // Our exact origin: http:// is blocked as mixed content on https sites, and nothing serves other ports
        const ours =
            src.protocol === SITE_URL.protocol && src.port === SITE_URL.port && sameSite(src, SITE_URL);
        return ours && src.pathname === "/embed.js" ? Number(id) : null;
    } catch {
        return null;
    }
}

/** Attributes of each <meta> in the document's real head, in order. */
function* headMetaTags(html: string): Generator<Map<string, string>> {
    const cleaned = withoutInert(html.slice(0, MAX_SCAN));
    const headEnd = cleaned.search(/<\/head\s*>/i);
    for (const [, tagName, rawAttributes] of (headEnd === -1 ? cleaned : cleaned.slice(0, headEnd)).matchAll(
        TAG
    )) {
        const name = tagName.toLowerCase();
        if (!HEAD_ELEMENTS.has(name)) return;
        if (name !== "meta") continue;
        yield new Map([...parseAttributes(rawAttributes)].map(([key, value]) => [key, value.trim()]));
    }
}

/** Whether `html`'s head has `<meta name="uoft-webring" content="…">` with `value`, attributes in any order. */
export function hasVerificationMetaTag(html: string, value: string): boolean {
    for (const attributes of headMetaTags(html)) {
        if (
            attributes.get("name")?.toLowerCase() === TXT_RECORD_NAME &&
            attributes.get("content") === value
        ) {
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
    const response = await safeFetch(homepage.toString(), {
        method: "GET",
        timeoutMs: 8000,
        maxBytes: 1024 * 1024,
    });
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

// The lookbehind keeps look-alike hosts out (evil-uoftwebring.com, notuoftwebring.com)
const WIDGET_LINK = /(?<![\w.-])(?:www\.)?uoftwebring\.com\/redirect\?([^"'\s<>`]*)/gi;

export type RingWidgetResult = "found" | "partial" | "wrong_id" | "missing" | "js_rendered" | "unreachable";

// Empty mount points of client-rendered apps (CRA, Vite, Next/Nuxt/Svelte SPA shells). Linear: no
// part can match the same characters as another.
const APP_SHELL =
    /<div\s+id=["'](?:root|app|__next|__nuxt|svelte)["'][^<>]*>\s*<\/div>|enable javascript to run this app/i;

// `href="/redirect?..."`: only valid on uoftwebring.com itself (elsewhere it's that site's own path)
const RELATIVE_WIDGET_LINK = /href=["']\/redirect\?([^"'\s<>`]*)/gi;

/**
 * What the member's homepage HTML says about their widget. `onRingSite` accepts relative links,
 * which only point at us when the page is uoftwebring.com itself.
 */
export function analyzeRingWidget(
    html: string,
    ringId: number,
    onRingSite = false
): Exclude<RingWidgetResult, "unreachable"> {
    const own = new Set<string>();
    let otherId = false;
    // A commented-out widget, or one written by a script, isn't a working widget
    const embedIds: number[] = [];
    const live = withoutInert(html, (rawAttributes) => {
        const id = embedWidgetId(rawAttributes);
        if (id !== null) embedIds.push(id);
    });
    const matches = [
        ...live.matchAll(WIDGET_LINK),
        ...(onRingSite ? live.matchAll(RELATIVE_WIDGET_LINK) : []),
    ];
    for (const match of matches) {
        const params = new URLSearchParams(match[1].replaceAll("&amp;", "&"));
        const nav = params.get("nav");
        if (nav !== "prev" && nav !== "next") continue;
        if (params.get("id") === String(ringId)) own.add(nav);
        else otherId = true;
    }
    // The one-line widget's links only exist once it runs, so its tag counts as both links
    if (embedIds.includes(ringId)) return "found";
    if (embedIds.length > 0) otherId = true;
    if (own.size === 2) return "found";
    if (own.size === 1) return "partial";
    if (otherId) return "wrong_id";
    return APP_SHELL.test(html) ? "js_rendered" : "missing";
}

/** Whether `html` links to both the previous and next member from `ringId`. */
export function hasRingWidget(html: string, ringId: number): boolean {
    return analyzeRingWidget(html, ringId) === "found";
}

/** A widget check plus how the site answered, for link-health stats. */
export type RingProbe = { result: RingWidgetResult; httpStatus: number | null; latencyMs: number };

export async function probeRingWidget(domain: string, ringId: number): Promise<RingProbe> {
    const started = performance.now();
    // The widget belongs in the static HTML; scanning past the first 2MB isn't worth it
    // 8 hops like isUrlReachable: http → https → www → /en/ is a working site, and a null status counts as down
    const response = await safeFetch(domain, {
        method: "GET",
        timeoutMs: 8000,
        maxRedirects: 8,
        maxBytes: 2 * 1024 * 1024,
    });
    const latencyMs = Math.round(performance.now() - started);
    const httpStatus = response?.status ?? null;
    if (!response || !response.ok) return { result: "unreachable", httpStatus, latencyMs };
    const onRingSite = sameSite(new URL(response.url), SITE_URL);
    return {
        result: analyzeRingWidget(response.body.toString("utf8"), ringId, onRingSite),
        httpStatus,
        latencyMs,
    };
}
