import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({ serverEnv: () => ({ DOMAIN_VALIDATION_SECRET_KEY: "test-secret" }) }));

import { widgetSnippets } from "@/lib/join-snippets";
import { hasRingWidget, txtRecordValue } from "@/lib/verification";

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
