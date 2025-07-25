"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { SafeUser, SafeUserType } from "@/utils/zod";
import { PostgrestError } from "@supabase/supabase-js";

type FetchRingProfilesResponse =
    | {
          ringProfiles: SafeUserType[];
          error: null;
      }
    | {
          ringProfiles: null;
          error: string;
      };

export async function fetchRingProfiles(): Promise<FetchRingProfilesResponse> {
    console.log("FETCHING PROFILES FOR RING");
    // First, we get the client and fetch everything
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("profile")
        .select("*")
        .order("ring_id", { ascending: true });

    if (error) {
        return {
            ringProfiles: null,
            error: `Error: ${(error as PostgrestError).message}`,
        };
    }
    if (!data) {
        return { ringProfiles: null, error: "Error: No data returned." };
    }

    // Next, we filter profiles that are not allowed to be in the ring
    // Currently, no filtering is being done since a valid domain is required upon registration
    // Below is some boiletplate code.

    /* newData = newData.filter((profile) => {
            return profile.
        }) */

    // Since the data we are getting is exactly like the data we want to return,
    // we can parse it directly into SafeUser[]
    // If the data is not in the correct format, it will throw an error
    const parsedData = await SafeUser.array().safeParseAsync(data);
    if (!parsedData.success) {
        return {
            ringProfiles: null,
            error: "Error: Failed to parse Supabase response into SafeUser[].",
        };
    }
    return {
        ringProfiles: parsedData.data,
        error: null,
    };
}
