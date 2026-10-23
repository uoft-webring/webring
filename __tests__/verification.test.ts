import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({ serverEnv: () => ({ DOMAIN_VALIDATION_SECRET_KEY: "test-secret" }) }));

import { widgetSnippets } from "@/lib/join-snippets";
import { hasRingWidget, hasVerificationMetaTag, txtRecordValue } from "@/lib/verification";

describe("hasRingWidget", () => {
    it("detects the snippet we hand out", () => {
        const html = widgetSnippets(12, "SVG", "Blue")[0].code;
        expect(hasRingWidget(html, 12)).toBe(true);
    });

    it("handles HTML-escaped ampersands and reordered params", () => {
        const html = `<a href="https://uoftwebring.com/redirect?id=4&amp;nav=prev">←</a>
            <a href='https://www.uoftwebring.com/redirect?nav=next&id=4'>→</a>`;
        expect(hasRingWidget(html, 4)).toBe(true);
    });

    it("requires both directions", () => {
        expect(hasRingWidget(`<a href="https://uoftwebring.com/redirect?nav=prev&id=4">`, 4)).toBe(false);
    });

    it("requires the member's own ring id", () => {
        const html = widgetSnippets(5, "PNG", "Black")[1].code;
        expect(hasRingWidget(html, 50)).toBe(false);
    });
});

describe("txtRecordValue", () => {
    it("is deterministic per ring id and URL-safe", () => {
        expect(txtRecordValue(3)).toBe(txtRecordValue(3));
        expect(txtRecordValue(3)).not.toBe(txtRecordValue(4));
        expect(txtRecordValue(3)).toMatch(/^[A-Za-z0-9_-]+$/);
    });
});

describe("hasVerificationMetaTag", () => {
    const value = "abc_123-XYZ";

    it("detects the tag we hand out", () => {
        expect(
            hasVerificationMetaTag(`<head><meta name="uoft-webring" content="${value}" /></head>`, value)
        ).toBe(true);
    });

    it("accepts any attribute order, quoting, case and extra attributes", () => {
        expect(
            hasVerificationMetaTag(`<META content='${value}' data-x="1" NAME="UofT-Webring">`, value)
        ).toBe(true);
        expect(hasVerificationMetaTag(`<meta name=uoft-webring content=${value}>`, value)).toBe(true);
    });

    it("requires the member's own value", () => {
        expect(hasVerificationMetaTag(`<meta name="uoft-webring" content="someone-else">`, value)).toBe(
            false
        );
        expect(hasVerificationMetaTag(`<meta name="uoft-webring" content="${value}extra">`, value)).toBe(
            false
        );
    });

    it("ignores the value outside a uoft-webring meta tag", () => {
        expect(hasVerificationMetaTag(`<meta name="description" content="${value}">`, value)).toBe(false);
        expect(hasVerificationMetaTag(`<p>uoft-webring ${value}</p>`, value)).toBe(false);
        expect(hasVerificationMetaTag(`<meta name="uoft-webring">${value}`, value)).toBe(false);
    });

    it("only counts real <meta> elements in the document head", () => {
        const tag = `<meta name=uoft-webring content=${value}>`;
        // Each of these echoes the tag somewhere a browser wouldn't treat it as a meta element
        for (const html of [
            `<!-- ${tag} -->`,
            `<script>window.__S={"q":"${tag}"}</script>`,
            `<textarea>${tag}</textarea>`,
            `<title>${tag}</title>`,
            `<html><head></head><body>${tag}</body></html>`,
            `<input value="${tag}">`,
        ]) {
            expect(hasVerificationMetaTag(html, value), html).toBe(false);
        }
    });

    it("isn't fooled by attribute names it doesn't know or by duplicates", () => {
        expect(
            hasVerificationMetaTag(`<meta property="og:description" data-v2="name=uoft-webring content=${value}">`, value)
        ).toBe(false);
        // Browsers keep the first `name`
        expect(hasVerificationMetaTag(`<meta name="description" name="uoft-webring" content="${value}">`, value)).toBe(
            false
        );
    });

    it("still finds a real tag next to scripts and comments", () => {
        const html = `<html><head><!-- hi --><script>var a = "<b>";</script><meta name="uoft-webring" content="${value}"></head><body></body></html>`;
        expect(hasVerificationMetaTag(html, value)).toBe(true);
    });
});

