import { describe, expect, it } from "vitest";
import { anonClient, dbTestsEnabled } from "./client";

// Read-only. Expectations come from supabase/migrations/20260509120000_harden_profile.sql,
// 20260513120000_ring_stats_and_open_to_work.sql and 20261023021904_auth_rate_limit.sql:
// anon has no table privileges on profile, ring_visit_daily or auth_rate_limit.

/** Pulls every email-looking string out of a response payload, whatever shape it came back in. */
function emailValues(data: unknown): string[] {
    if (!Array.isArray(data)) return [];
    return data.flatMap((row: unknown) => {
        if (typeof row !== "object" || row === null || !("email" in row)) return [];
        const value = row.email;
        return typeof value === "string" && value !== "" ? [value] : [];
    });
}

describe.skipIf(!dbTestsEnabled())("member email privacy (anon)", () => {
    it("selecting email from public.profile is denied or returns no email values", async () => {
        const { data, error } = await anonClient().from("profile").select("email");
        expect(emailValues(data)).toEqual([]);
        expect(error).not.toBeNull();
    });

    it("select(*) from public.profile does not expose email", async () => {
        const { data, error } = await anonClient().from("profile").select("*");
        expect(emailValues(data)).toEqual([]);
        expect(error).not.toBeNull();
    });

    it("selecting id alongside email does not expose email", async () => {
        const { data, error } = await anonClient().from("profile").select("id, email");
        expect(emailValues(data)).toEqual([]);
        expect(error).not.toBeNull();
    });

    it("anon cannot read any profile row, public columns included", async () => {
        // The app reads public columns server-side with the service role. If anon can read rows
        // here, the table grant has been widened and every profile column becomes public.
        const { data, error } = await anonClient().from("profile").select("ring_id, name, domain");
        expect(data ?? []).toEqual([]);
        expect(error).not.toBeNull();
    });
});

describe.skipIf(!dbTestsEnabled())("internal tables are closed to anon", () => {
    it("ring_visit_daily cannot be selected by anon", async () => {
        const { data, error } = await anonClient().from("ring_visit_daily").select("*");
        expect(data ?? []).toEqual([]);
        expect(error).not.toBeNull();
    });

    it("auth_rate_limit cannot be selected by anon", async () => {
        const { data, error } = await anonClient().from("auth_rate_limit").select("*");
        expect(data ?? []).toEqual([]);
        expect(error).not.toBeNull();
    });
});
