"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (name: string, email: string) => {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    console.log(origin);

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            data: {
                //  attach user meta data
                name: name,
            },
            // emailRedirectTo: `${origin}/`,
        },
    });

    if (error) {
        console.error(error.code + " " + error.message);
    } else {
        return redirect(`/auth/confirm?email=${email}`); // return email in auth/confirm link as a search param
    }
};
