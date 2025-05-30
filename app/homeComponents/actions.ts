"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { UserType } from "@/utils/zod";
import { PostgrestError } from "@supabase/supabase-js";

export async function fetchProfilesForRing() {
    // First, we get the client and fetch everything
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("profile")
        .select("*")
        .order("ring_id", { ascending: true });

    if (error) {
        return {
            data: null,
            error: `Error: ${(error as PostgrestError).message}`,
        };
    }

    // Next, we filter profiles that are not allowed to be in the ring
    // Currently, no filtering is being done since a valid domain is required upon registration
    // Below is some boiletplate code.

    /* newData = newData.filter((profile) => {
            return profile.
        }) */

    let newData;
    try {
        newData = data as UserType[];
    } catch {
        return { data: null, error: "Error: Parse failed." };
    }

    return {
        data: newData.map((profile) => {
            return {
                name: profile.name,
                ring_id: profile.ring_id,
                tagline: profile.tagline,
                domain: profile.domain,
                image_url: profile.image_url,
                is_verified: profile.is_verified,
                github_url: profile.github_url,
                tags: profile.tags,
            };
        }),
        error: null,
    };
    // if (error instanceof PostgrestError) {
    //     return { data: null, error: error.message };
    // }
    // return { data: null, error: null };
}
