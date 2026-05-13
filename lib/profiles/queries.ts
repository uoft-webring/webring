import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { fail, ok, type Result } from "@/lib/result";
import { PUBLIC_PROFILE_COLUMNS, toPublicProfile, type PublicProfileRow } from "./mapper";
import type { PublicProfile } from "./types";

export const PROFILES_TAG = "profiles";

// One cached read backs the home page, directory, profile pages and sitemap.
// The ring is small (hundreds of rows), so slicing this list beats a query per request.
const loadPublicProfiles = unstable_cache(
    async (): Promise<PublicProfile[]> => {
        const { data, error } = await createAdminClient()
            .from("profile")
            .select(PUBLIC_PROFILE_COLUMNS)
            .order("ring_id", { ascending: true })
            .returns<PublicProfileRow[]>();

        // Throw so a failed read is never cached
        if (error) throw new Error(error.message);
        return data.map(toPublicProfile);
    },
    ["public-profiles-v1"],
    { revalidate: 300, tags: [PROFILES_TAG] }
);

export const getPublicProfiles = cache(async (): Promise<Result<PublicProfile[]>> => {
    try {
        return ok(await loadPublicProfiles());
    } catch (error) {
        unstable_rethrow(error);
        console.error("[profiles] Failed to load profiles:", error);
        return fail("Could not load profiles.");
    }
});

export async function getPublicProfileBySlug(slug: string): Promise<Result<PublicProfile | null>> {
    const { data, error } = await getPublicProfiles();
    if (error !== null) return fail(error);
    return ok(data.find((profile) => profile.slug === slug) ?? null);
}
