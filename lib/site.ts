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
