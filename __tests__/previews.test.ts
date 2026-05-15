import { describe, expect, it } from "vitest";
import { extractPreviewImageUrl } from "@/lib/previews";

describe("extractPreviewImageUrl", () => {
    it("reads og:image regardless of attribute order", () => {
        expect(extractPreviewImageUrl(`<meta content="https://cdn.x.dev/og.png" property="og:image">`, "https://x.dev")).toBe(
            "https://cdn.x.dev/og.png"
        );
    });

    it("falls back to twitter:image and resolves relative URLs", () => {
        expect(extractPreviewImageUrl(`<meta name='twitter:image' content='/img/card.jpg?a=1&amp;b=2'>`, "https://x.dev/blog/")).toBe(
            "https://x.dev/img/card.jpg?a=1&b=2"
        );
    });

    it("ignores non-http(s) and missing images", () => {
        expect(extractPreviewImageUrl(`<meta property="og:image" content="javascript:alert(1)">`, "https://x.dev")).toBeNull();
        expect(extractPreviewImageUrl(`<meta property="og:title" content="Hi">`, "https://x.dev")).toBeNull();
        expect(extractPreviewImageUrl("", "https://x.dev")).toBeNull();
    });
});
