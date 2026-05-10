import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OWN_PROFILE_COLUMNS, toOwnProfile, type OwnProfileRow } from "@/lib/profiles/mapper";
import type { OwnProfile } from "@/lib/profiles/types";

export type AuthUser = { id: string; email: string };

/**
 * The verified signed-in user, or null. Deduplicated per request with React `cache`, so layouts,
 * pages and the navbar can all call it without extra auth round-trips.
 */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
    const supabase = await createClient();
    // getClaims verifies the JWT locally with asymmetric keys and falls back to the Auth server otherwise
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims.sub) return null;
    return { id: data.claims.sub, email: data.claims.email ?? "" };
});

export const getOwnProfile = cache(async (): Promise<OwnProfile | null> => {
    const user = await getAuthUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profile")
        .select(OWN_PROFILE_COLUMNS)
        .eq("id", user.id)
        .maybeSingle<OwnProfileRow>();

    // Throw rather than return null: null means "no profile", which sends the user to /signin
    if (error) throw new Error(`Failed to load own profile: ${error.message}`);
    return data ? toOwnProfile(data) : null;
});

export async function requireOwnProfile(): Promise<OwnProfile> {
    const profile = await getOwnProfile();
    if (!profile) redirect("/signin");
    return profile;
}

/** For public pages (navbar, sign-in redirect): a failed profile read just renders as signed out. */
export async function getViewerProfile(): Promise<OwnProfile | null> {
    try {
        return await getOwnProfile();
    } catch (error) {
        console.error("[auth]", error);
        return null;
    }
}
