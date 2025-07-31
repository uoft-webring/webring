"use server";

import {
    createAdminClient,
    createClient,
    createServiceClient,
} from "@/utils/supabase/server";
import { SafeUser, SafeUserType } from "@/utils/zod";
import { PostgrestError } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";
import { UserType } from "@/utils/zod";
import { getAuthUser } from "./dashboard/actions";
import { redirect } from "next/navigation";

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
    const supabase = createAdminClient(); // Requires admin client to bypass RLS
    const { data, error } = await supabase
        .from("profile")
        .select(
            "ring_id, tagline, domain, name, valid, github_url, image_url, is_verified, tags"
        )
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

    return {
        ringProfiles: data,
        error: null,
    };
}

export const getUserProfile = async () => {
    const supabase = await createClient();

    const { data, error: dataError } = await supabase
        .from("profile")
        .select("*");

    return {
        data: data?.at(0) as UserType,
        error: dataError,
    };
};
