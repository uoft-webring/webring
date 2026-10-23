import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
    serverEnv: () => ({ DOMAIN_VALIDATION_SECRET_KEY: "test-secret" }),
    siteUrl: (path: string) => new URL(path, "https://uoftwebring.com").toString(),
}));
vi.mock("@/lib/supabase/server", () => ({ createAdminClient: vi.fn() }));

const { isValidUnsubscribeToken, unsubscribeParamsSchema, unsubscribeToken, unsubscribeUrls } = await import(
    "@/lib/unsubscribe"
);

const id = "6f1c2a8e-3b4d-4e5f-8a9b-0c1d2e3f4a5b";

describe("unsubscribe links", () => {
    it("accept their own token", () => {
        expect(isValidUnsubscribeToken("member", id, unsubscribeToken("member", id))).toBe(true);
    });

    it("reject another member's token or a tampered one", () => {
        const other = "00000000-0000-4000-8000-000000000000";
        expect(isValidUnsubscribeToken("member", id, unsubscribeToken("member", other))).toBe(false);
        expect(isValidUnsubscribeToken("member", id, unsubscribeToken("member", id).slice(1))).toBe(false);
        expect(isValidUnsubscribeToken("member", id, "")).toBe(false);
    });

    it("build page and one-click URLs that parse back", () => {
        const { page, oneClick } = unsubscribeUrls("member", id);
        expect(new URL(page).pathname).toBe("/unsubscribe");
        expect(new URL(oneClick).pathname).toBe("/api/unsubscribe");
        const params = unsubscribeParamsSchema.parse(Object.fromEntries(new URL(page).searchParams));
        expect(isValidUnsubscribeToken(params.kind, params.id, params.token)).toBe(true);
    });
});
