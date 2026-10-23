// Canonical public origin: embed snippets, metadata and share links always point at production.
export const SITE_ORIGIN = "https://uoftwebring.com";

export function profilePath(slug: string): string {
    return `/u/${encodeURIComponent(slug)}`;
}

export function profileUrl(slug: string): string {
    return `${SITE_ORIGIN}${profilePath(slug)}`;
}

/** "https://www.jane.dev/" -> "jane.dev", for link labels. */
export function displayDomain(domain: string): string {
    return domain.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

/**
 * Short hash of a member's domain for their preview image URL: a new domain gets a new URL (so CDN
 * and browser caches never show the old site), and the route rejects any other value.
 */
export function previewVersion(domain: string): string {
    // FNV-1a: tiny, deterministic, and runs in the browser too; this isn't a security boundary
    let hash = 0x811c9dc5;
    for (let i = 0; i < domain.length; i++) {
        hash ^= domain.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
}
