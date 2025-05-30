"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// TODO: throw error when user is already registered
export const signUpAction = async (name: string, email: string) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            data: {
                //  attach user metadata
                name: name,
                domain: "anwar's big ass",
            },
        },
    });

    if (error) {
        console.error(error.code + " " + error.message);
    } else {
        return redirect(`/auth/confirm?email=${email}`); // return email in auth/confirm link as a search param
    }
};
