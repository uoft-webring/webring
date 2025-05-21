"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signInAction = async (email: string) => {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    console.log(origin);

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
        },
    });

    if (error) return { error };

    return {}; // return email in auth/confirm link as a search param
};
