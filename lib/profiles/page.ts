import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import {
    ACCENTS,
    customLinkSchema,
    EMPTY_PAGE_CONTENT,
    experienceSchema,
    MAX_ABOUT_LENGTH,
    projectSchema,
    type Accent,
    type PageContent,
} from "@/lib/validation";
import { PROFILES_TAG } from "./queries";

export const PAGE_CONTENT_COLUMNS = "about, projects, experience, links, accent";

export type PageContentRow = {
    about: string | null;
    projects: unknown;
    experience: unknown;
    links: unknown;
    accent: string | null;
};

function validItems<T>(value: unknown, parse: (item: unknown) => { success: boolean; data?: T }): T[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
        const parsed = parse(item);
        return parsed.success && parsed.data !== undefined ? [parsed.data] : [];
    });
}

/** Rows are written through the same schema, but a bad item is dropped rather than breaking the page. */
export function toPageContent(row: PageContentRow | null): PageContent {
    if (!row) return EMPTY_PAGE_CONTENT;
    return {
        about: (row.about ?? "").slice(0, MAX_ABOUT_LENGTH),
        projects: validItems(row.projects, (item) => projectSchema.safeParse(item)),
        experience: validItems(row.experience, (item) => experienceSchema.safeParse(item)),
        links: validItems(row.links, (item) => customLinkSchema.safeParse(item)),
        accent: ACCENTS.includes(row.accent as Accent) ? (row.accent as Accent) : "periwinkle",
    };
}

// Kept out of the shared profile list: only a member's own page needs it, and that list is sent
// to the client on the home page
const loadPageContent = unstable_cache(
    async (ringId: number): Promise<PageContent> => {
        const { data, error } = await createAdminClient()
            .from("profile")
            .select(PAGE_CONTENT_COLUMNS)
            .eq("ring_id", ringId)
            .maybeSingle<PageContentRow>();
        // Throw so a failed read is never cached
        if (error) throw new Error(error.message);
        return toPageContent(data);
    },
    ["page-content-v1"],
    { revalidate: 300, tags: [PROFILES_TAG] }
);

/** A member's page content, or the empty page if it can't be read (the rest of the page still renders). */
export async function getPageContent(ringId: number): Promise<PageContent> {
    try {
        return await loadPageContent(ringId);
    } catch (error) {
        console.error("[profiles] Failed to load page content:", error);
        return EMPTY_PAGE_CONTENT;
    }
}

/** The signed-in member's own content for the editor: always fresh, never the public cache. */
export async function getOwnPageContent(profileId: string): Promise<PageContent | null> {
    const { data, error } = await createAdminClient()
        .from("profile")
        .select(PAGE_CONTENT_COLUMNS)
        .eq("id", profileId)
        .maybeSingle<PageContentRow>();
    if (error) {
        console.error("[profiles] Failed to load own page content:", error.message);
        return null;
    }
    return toPageContent(data);
}
