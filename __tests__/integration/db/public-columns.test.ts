import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { PUBLIC_PROFILE_COLUMNS } from "@/lib/profiles/mapper";
import { ACCENTS, IMAGE_KEY, MAX_TAGLINE_LENGTH, MAX_TAGS, pageContentSchema } from "@/lib/validation";
import { dbTestsEnabled, serviceReadClient } from "./client";

// Read-only. Rows are read with the service role (see client.ts) because anon has no grant on
// public.profile. The app does the same in lib/profiles/queries.ts and lib/profiles/page.ts.
// The regexes below mirror the profile_* check constraints in supabase/schemas/profile.sql.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Reads PAGE_CONTENT_COLUMNS from its source so the test follows whatever the app selects. */
function pageContentColumns(): string {
    const source = readFileSync(path.join(ROOT, "lib/profiles/page.ts"), "utf8");
    const match = /export const PAGE_CONTENT_COLUMNS = "([^"]+)"/.exec(source);
    if (!match?.[1]) throw new Error("PAGE_CONTENT_COLUMNS not found in lib/profiles/page.ts");
    return match[1];
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/; // profile_slug_format
const DOMAIN = /^(https?:\/\/\S+)?$/; // profile_domain_format
const GITHUB = /^([A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38})?$/; // profile_github_format
const VALIDATION_TAG_MAX = 40; // lib/validation.ts profileInputSchema tag max

const publicRow = z.object({
    ring_id: z.number().int().nonnegative(),
    slug: z.string().regex(SLUG).min(2).max(40).nullable(),
    name: z.string().min(1).max(80).nullable(),
    tagline: z.string().max(MAX_TAGLINE_LENGTH).nullable(),
    domain: z.string().max(255).regex(DOMAIN).nullable(),
    github_url: z
        .string()
        .nullable()
        .refine((value) => value === null || GITHUB.test(value.trim()), "github_url format"),
    image_key: z
        .string()
        .nullable()
        .refine((value) => value === null || value === "" || IMAGE_KEY.test(value), "image_key format"),
    is_verified: z.boolean().nullable(),
    validated_user_component: z.enum(["disconnected", "pending", "connected"]).nullable(),
    tags: z.array(z.string().min(1).max(VALIDATION_TAG_MAX)).max(MAX_TAGS).nullable(),
    graduation_year: z.number().int().nullable(),
    program: z.string().min(2).max(60).nullable(),
    open_to_work: z.boolean().nullable(),
});

/** Asserts the response is a non-empty array, so the row checks below can never pass vacuously. */
function nonEmptyRows(data: unknown): unknown[] {
    expect(Array.isArray(data)).toBe(true);
    const rows = Array.isArray(data) ? data : [];
    expect(rows.length).toBeGreaterThan(0);
    return rows;
}

describe.skipIf(!dbTestsEnabled())("public profile columns", () => {
    it("the app's public select list never includes email", () => {
        expect(PUBLIC_PROFILE_COLUMNS).not.toMatch(/\bemail\b/);
    });

    it("every public profile row satisfies the profile check constraints and validation limits", async () => {
        const { data, error } = await serviceReadClient().from("profile").select(PUBLIC_PROFILE_COLUMNS);
        expect(error).toBeNull();
        const rows = nonEmptyRows(data);

        expect(z.array(publicRow).safeParse(rows).error?.issues ?? []).toEqual([]);
    });

    it("every row's about, projects, experience, links and accent parse with the page content schema", async () => {
        const { data, error } = await serviceReadClient().from("profile").select(pageContentColumns());
        expect(error).toBeNull();
        const rows = nonEmptyRows(data);

        const issues = rows.flatMap((row, index) => {
            const result = pageContentSchema.safeParse(row);
            return result.success
                ? []
                : result.error.issues.map(
                      (issue) => `row ${index}: ${issue.path.join(".")} ${issue.message}`
                  );
        });
        expect(issues).toEqual([]);
    });

    it("accent is one of the allowed values on every row", async () => {
        const { data, error } = await serviceReadClient().from("profile").select("accent");
        expect(error).toBeNull();
        const rows = nonEmptyRows(data);

        const accents = z.array(z.object({ accent: z.enum(ACCENTS) })).safeParse(rows);
        expect(accents.error?.issues ?? []).toEqual([]);
    });
});
