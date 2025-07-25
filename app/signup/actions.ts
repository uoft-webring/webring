"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// TODO: throw error when user is already registered
export const signUpAction = async (name: string, email: string) => {
    const supabase = await createAdminClient();

    const { data, error: search_error } = await supabase
        .from("profile")
        .select("*")
        .eq("email", email);

    if (data?.length) {
        return { error: 1 };
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            data: {
                //  attach user metadata
                name: name,
                domain: "",
            },
        },
    });

    if (error) {
        console.error(error.code + " " + error.message);
        return { error };
    } else {
        return {}; // return email in auth/confirm link as a search param
    }
};
