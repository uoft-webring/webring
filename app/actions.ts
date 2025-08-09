"use server";

import { createAdminClient, createClient } from "@/utils/supabase/server";
import { SafeUserType } from "@/utils/zod";
import { PostgrestError } from "@supabase/supabase-js";
import { UserType } from "@/utils/zod";

const PROFILE_COLUMNS =
    "ring_id, tagline, domain, name, validated_user_component, github_url, image_url, is_verified, tags, graduation_year, program";

// Generic response type for uniform handling
export type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };

// Specific aliases for clarity
type GetAllUserProfilesResponse = ApiResponse<SafeUserType[]>;
type GetUserProfileResponse = ApiResponse<SafeUserType>;
type GetAuthUserProfileResponse = ApiResponse<UserType>;

/**
 * Fetches all user profiles from the `profile` table.
 * Intended for server use only, as it bypasses Row Level Security (RLS) using an admin client.
 *
 * @returns {Promise<GetAllUserProfilesResponse>}
 * An object containing all user profiles in `data` if successful,
 * or an error message in `error` if the operation fails.
 */
export async function getAllUserProfiles(): Promise<GetAllUserProfilesResponse> {
    // To fetch all user profiles, we need an admin client to bypass RLS
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("profile")
        .select(PROFILE_COLUMNS)
        .order("ring_id", { ascending: true });

    if (error) {
        return {
            data: null,
            error: `Error: ${(error as PostgrestError).message}`,
        };
    }

    return data ? { data, error: null } : { data: null, error: "Error: No data returned." };
}

/**
 * Retrieves the authenticated user's profile from the `profile` table.
 *
 * Requires the user to be signed in. The user's ID is obtained from the Supabase auth session.
 *
 * @returns {Promise<GetAuthUserProfileResponse>}
 * An object containing the user's profile in `data` if successful,
 * or an error message in `error` if the user is not authenticated or the query fails.
 */
export const getAuthUserProfile = async (): Promise<GetAuthUserProfileResponse> => {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: authError?.message ?? "Auth error" };
    }

    const { data, error } = await supabase.from("profile").select("*").eq("id", user.id).single();

    return data
        ? { data: data as UserType, error: null }
        : { data: null, error: error?.message ?? "Error fetching profile" };
};

/**
 * Fetches a single user profile by its associated `subdomain` slug.
 * Intended for server use, as it bypasses Row Level Security (RLS) using an admin client.
 *
 * @param {string} slug - The `subdomain` identifier corresponding to the user profile.
 * @returns {Promise<GetUserProfileResponse>}
 * An object containing the matching user profile in `data` if found,
 * or an error message in `error` if the profile is not found or the query fails.
 */
export const getUserProfile = async (slug: string): Promise<GetUserProfileResponse> => {
    // To fetch an arbitrary user (not the curr user), we need an admin client to bypass RLS
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("profile")
        .select(PROFILE_COLUMNS)
        .eq("subdomain", slug)
        .single();

    if (error) {
        return {
            data: null,
            error: `Error: ${(error as PostgrestError).message}`,
        };
    }
    return data ? { data, error: null } : { data: null, error: "Error: No data returned." };
};
