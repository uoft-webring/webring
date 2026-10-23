import "server-only";
import { unstable_cache } from "next/cache";
import sharp from "sharp";
import { safeFetch } from "@/lib/url-safety";

export const PREVIEW_WIDTH = 640;
export const PREVIEW_HEIGHT = 336;

const PREVIEW_META = /<meta\b[^>]*>/gi;
const PREVIEW_KEYS = ["og:image", "og:image:url", "og:image:secure_url", "twitter:image", "twitter:image:src"];

/** The social preview image a site declares for itself (og:image / twitter:image), as an absolute URL. */
export function extractPreviewImageUrl(html: string, pageUrl: string): string | null {
    for (const tag of html.match(PREVIEW_META) ?? []) {
        const key = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
        const content = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1]?.trim();
        if (!key || !content || !PREVIEW_KEYS.includes(key)) continue;
        try {
            const url = new URL(content.replaceAll("&amp;", "&"), pageUrl);
            if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
        } catch {
            // malformed content attribute: try the next tag
        }
    }
    return null;
}

export const PREVIEWS_TAG = "previews";

/**
 * `renderSitePreview` cached per domain, as base64 (the data cache stores JSON). Without this every
 * CDN miss would refetch the member's site and re-run sharp.
 */
export const cachedSitePreview = unstable_cache(
    async (domain: string): Promise<string | null> => (await renderSitePreview(domain))?.toString("base64") ?? null,
    ["site-preview"],
    { revalidate: 86400, tags: [PREVIEWS_TAG] }
);

/**
 * A small WebP of the member's own preview image, or null if their site doesn't declare one.
 * Re-encoding means we never pass third-party bytes (or SVG) straight through to visitors.
 */
export async function renderSitePreview(domain: string): Promise<Buffer | null> {
    const page = await safeFetch(domain, { maxBytes: 512 * 1024, timeoutMs: 6000 });
    if (!page?.ok) return null;

    const imageUrl = extractPreviewImageUrl(page.body.toString("utf8"), domain);
    if (!imageUrl) return null;

    const image = await safeFetch(imageUrl, { maxBytes: 8 * 1024 * 1024, timeoutMs: 6000 });
    if (!image?.ok || image.truncated || !image.contentType.startsWith("image/")) return null;

    try {
        return await sharp(image.body, { limitInputPixels: 40_000_000, animated: false })
            .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT, { fit: "cover", position: "top" })
            .webp({ quality: 72 })
            .toBuffer();
    } catch {
        // Unsupported or corrupt image
        return null;
    }
}
