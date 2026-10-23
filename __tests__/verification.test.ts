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

    it("ignores commented-out links and look-alike hosts", () => {
        const html = `<!-- <a href="https://uoftwebring.com/redirect?nav=prev&id=5">←</a> -->
            <a href="https://evil-uoftwebring.com/redirect?nav=next&id=5">→</a>
            <a href="https://notuoftwebring.com/redirect?nav=prev&id=5">←</a>`;
        expect(hasRingWidget(html, 5)).toBe(false);
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

    it("stays fast on hostile pages built to make the parser backtrack", () => {
        const big = 256 * 1024;
        for (const html of [
            "<a".repeat(big / 2),
            '<a"'.repeat(big / 3),
            "<a '".repeat(big / 4),
            `<meta ${"x".repeat(big)}`,
            `<meta a=${"=".repeat(big)}`,
            "<script ".repeat(big / 8),
            "<!-- ".repeat(big / 5),
            "</script>".repeat(big / 9),
            `<meta name="uoft-webring" content="${"x".repeat(big)}`,
        ]) {
            const start = performance.now();
            hasVerificationMetaTag(html + "x".repeat(1024 * 1024), value);
            expect(performance.now() - start, html.slice(0, 12)).toBeLessThan(500);
        }
    });

    it("treats an unclosed comment or script as running to the end", () => {
        expect(hasVerificationMetaTag(`<!-- <meta name="uoft-webring" content="${value}">`, value)).toBe(false);
        expect(hasVerificationMetaTag(`<script> <meta name="uoft-webring" content="${value}">`, value)).toBe(false);
        expect(hasVerificationMetaTag(`<script></script><meta name="uoft-webring" content="${value}">`, value)).toBe(true);
    });

    it("accepts a typical generated page head", () => {
        const html = `<!DOCTYPE html><HTML lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="preload" href="/_next/static/media/font.woff2" as="font" crossorigin=""/><script src="/_next/static/chunks/main.js" async=""></script>
<title>Jane | Portfolio</title><meta property="og:image" content="https://jane.dev/og.png?a=1&amp;b=2"/>
<META NAME="uoft-webring" CONTENT="${value}" /><noscript><img src="x"></noscript></head><body><div>hi</div></body></HTML>`;
        expect(hasVerificationMetaTag(html, value)).toBe(true);
    });
});

