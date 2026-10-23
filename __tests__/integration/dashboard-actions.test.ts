import { beforeEach, describe, expect, it, vi } from "vitest";
import { updatePageContent, updateProfile } from "@/app/dashboard/actions";
import { PROFILES_TAG } from "@/lib/profiles/queries";
import type { ProfileInput } from "@/lib/validation";
import { updateTag } from "next/cache";

type Row = Record<string, unknown>;

// Outer boundary only: the Supabase clients and the cookie/header stores. Everything above them is real.
const db = vi.hoisted(() => ({
    user: null as { sub: string; email: string } | null,
    profile: null as Record<string, unknown> | null,
    writeError: null as { code?: string; message: string } | null,
    updates: [] as Array<{
        table: string;
        values: Record<string, unknown>;
        filters: Array<[string, unknown]>;
    }>,
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
    unstable_cache: <T>(fn: T): T => fn,
}));

vi.mock("next/headers", () => ({
    headers: async () => new Headers(),
    cookies: async () => ({ getAll: () => [] }),
}));

vi.mock("@/lib/supabase/server", () => {
    function query(table: string) {
        const filters: Array<[string, unknown]> = [];
        let pending: Record<string, unknown> | null = null;
        const builder = {
            select: () => builder,
            eq(column: string, value: unknown) {
                filters.push([column, value]);
                return builder;
            },
            update(values: Record<string, unknown>) {
                pending = values;
                return builder;
            },
            async single() {
                if (pending === null) return { data: db.profile, error: null };
                db.updates.push({ table, values: pending, filters: [...filters] });
                if (db.writeError) return { data: null, error: db.writeError };
                // Mirrors PostgREST returning the updated row
                return { data: { ...db.profile, ...pending }, error: null };
            },
            async maybeSingle() {
                return { data: db.profile, error: null };
            },
        };
        return builder;
    }

    const client = {
        from: query,
        auth: {
            getClaims: async () =>
                db.user
                    ? { data: { claims: { sub: db.user.sub, email: db.user.email } }, error: null }
                    : { data: null, error: { message: "Auth session missing!" } },
        },
    };
    return {
        createClient: async () => client,
        createAdminClient: () => client,
    };
});

const USER_ID = "11111111-2222-4333-8444-555555555555";
const OTHER_USER_ID = "99999999-8888-4777-8666-555555555555";
const DOMAIN = "https://ada.example.ca";

function ownRow(overrides: Row = {}): Row {
    return {
        id: USER_ID,
        email: "ada@mail.utoronto.ca",
        ring_id: 7,
        slug: "ada",
        name: "Ada Lovelace",
        tagline: "Engines",
        domain: DOMAIN,
        github_url: "",
        image_key: "",
        is_verified: false,
        validated_user_component: "disconnected",
        tags: ["ml"],
        graduation_year: 2027,
        program: "Computer Science",
        open_to_work: false,
        about: "",
        projects: [],
        experience: [],
        links: [],
        accent: "periwinkle",
        ...overrides,
    };
}

function profileInput(overrides: Partial<ProfileInput> = {}): ProfileInput {
    return {
        name: "Ada Lovelace",
        domain: DOMAIN,
        tagline: "Engines",
        githubUsername: "ada",
        imageKey: "",
        tags: ["ml"],
        graduationYear: 2027,
        program: "Computer Science",
        slug: "ada",
        openToWork: false,
        ...overrides,
    };
}

function pageInput(overrides: Row = {}): Row {
    return { about: "Hello", projects: [], experience: [], links: [], accent: "lake", ...overrides };
}

beforeEach(() => {
    vi.clearAllMocks();
    db.user = { sub: USER_ID, email: "ada@mail.utoronto.ca" };
    db.profile = ownRow();
    db.writeError = null;
    db.updates = [];
});

describe("updatePageContent", () => {
    it("rejects a signed-out caller without writing", async () => {
        db.user = null;
        const result = await updatePageContent(pageInput());
        expect(result).toEqual({ data: null, error: "Please sign in again." });
        expect(db.updates).toHaveLength(0);
        expect(updateTag).not.toHaveBeenCalled();
    });

    it("rejects invalid content without writing", async () => {
        const result = await updatePageContent(pageInput({ about: "x".repeat(4001) }));
        expect(result.error).toBe("About can be at most 4000 characters.");
        expect(db.updates).toHaveLength(0);
        expect(updateTag).not.toHaveBeenCalled();
    });

    it("rejects an unknown accent and a non-object payload without writing", async () => {
        expect((await updatePageContent(pageInput({ accent: "neon" }))).error).toBeTruthy();
        expect((await updatePageContent("not an object")).error).toBeTruthy();
        expect(db.updates).toHaveLength(0);
    });

    it("saves valid content to the caller's own row and busts the profiles cache", async () => {
        const input = pageInput({
            projects: [{ title: "Compiler", url: "https://github.com/ada/compiler", description: "Toy" }],
            links: [{ label: "Blog", url: "https://ada.example.ca/blog" }],
        });
        const result = await updatePageContent(input);

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({ about: "Hello", accent: "lake" });
        expect(db.updates).toEqual([
            {
                table: "profile",
                values: input,
                filters: [["id", USER_ID]],
            },
        ]);
        expect(updateTag).toHaveBeenCalledWith(PROFILES_TAG);
    });

    it("treats a whitespace-only project link as no link", async () => {
        const result = await updatePageContent(
            pageInput({ projects: [{ title: "Notes", url: "   ", description: "" }] })
        );
        expect(result.error).toBeNull();
        expect(db.updates[0].values.projects).toEqual([{ title: "Notes", url: "", description: "" }]);
    });

    it("returns a friendly error and hides the raw DB message", async () => {
        db.writeError = {
            code: "42501",
            message: 'permission denied for table "profile" (rls policy profile_update_20260101)',
        };
        const result = await updatePageContent(pageInput());
        expect(result).toEqual({ data: null, error: "Could not save your page." });
        expect(updateTag).not.toHaveBeenCalled();
    });
});

describe("updateProfile", () => {
    it("rejects a signed-out caller without writing", async () => {
        db.user = null;
        const result = await updateProfile(profileInput());
        expect(result).toEqual({ data: null, error: "Please sign in again." });
        expect(db.updates).toHaveLength(0);
    });

    it("rejects invalid input without writing", async () => {
        const result = await updateProfile(profileInput({ slug: "Not A Slug" }));
        expect(result.error).toBe("Slug can only contain lowercase letters, numbers, and hyphens.");
        expect(db.updates).toHaveLength(0);
        expect(updateTag).not.toHaveBeenCalled();
    });

    it("writes the snake_case row for the caller and busts the profiles cache", async () => {
        const result = await updateProfile(
            profileInput({ githubUsername: "ada-l", graduationYear: 2028, openToWork: true })
        );

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
            id: USER_ID,
            githubUsername: "ada-l",
            openToWork: true,
            slug: "ada",
        });
        expect(db.updates).toHaveLength(1);
        expect(db.updates[0]).toMatchObject({ table: "profile", filters: [["id", USER_ID]] });
        expect(db.updates[0].values).toEqual({
            name: "Ada Lovelace",
            domain: DOMAIN,
            tagline: "Engines",
            github_url: "ada-l",
            image_key: "",
            tags: ["ml"],
            graduation_year: 2028,
            program: "Computer Science",
            slug: "ada",
            open_to_work: true,
        });
        expect(updateTag).toHaveBeenCalledWith(PROFILES_TAG);
    });

    it("dedupes repeated tags before saving", async () => {
        const result = await updateProfile(profileInput({ tags: ["ml", "ml", "ai"] }));
        expect(result.error).toBeNull();
        expect(db.updates[0].values.tags).toEqual(["ml", "ai"]);
    });

    // Tag cap is checked before de-duplication, so four entries with one unique value are refused.
    // Likely unintended: the cap is meant for distinct tags.
    it("does not count duplicate tags against the three-tag cap", async () => {
        const result = await updateProfile(profileInput({ tags: ["ml", "ml", "ml", "ml"] }));
        expect(result.error).toBeNull();
    });

    it("refuses an avatar key that belongs to another member", async () => {
        const result = await updateProfile(profileInput({ imageKey: `${OTHER_USER_ID}_abc.avif` }));
        expect(result).toEqual({ data: null, error: "Invalid image." });
        expect(db.updates).toHaveLength(0);
    });

    it("accepts an avatar key the caller owns", async () => {
        const result = await updateProfile(profileInput({ imageKey: `${USER_ID}_abc.avif` }));
        expect(result.error).toBeNull();
        expect(db.updates[0].values.image_key).toBe(`${USER_ID}_abc.avif`);
    });

    it("reports a taken slug as a plain message", async () => {
        db.writeError = {
            code: "23505",
            message: 'duplicate key value violates unique constraint "profile_slug_key"',
        };
        const result = await updateProfile(profileInput());
        expect(result).toEqual({ data: null, error: "Slug already taken" });
        expect(updateTag).not.toHaveBeenCalled();
    });

    it("returns a friendly error and hides the raw DB message", async () => {
        db.writeError = { code: "XX000", message: "connection to server at 10.0.3.4 failed" };
        const result = await updateProfile(profileInput());
        expect(result).toEqual({ data: null, error: "Could not save your profile." });
        expect(JSON.stringify(result)).not.toContain("10.0.3.4");
        expect(updateTag).not.toHaveBeenCalled();
    });
});
