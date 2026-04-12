"use server";

import { createAdminClient } from "@/utils/supabase/server";

// TODO: throw error when user is already registered
export const signUpAction = async (name: string, email: string) => {
    const supabase = await createAdminClient();

    const { data } = await supabase.from("profile").select("*").eq("email", email);

    if (data?.length) {
        return { error: "Email already registered." };
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: `${process.env.VERCEL_ENV === "preview" ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_HOME_DOMAIN}/auth/callback`,
            data: {
                //  attach user metadata
                name: name,
                domain: "",
            },
        },
    });

    if (error) {
        console.error(error.code + " " + error.message);
        return { error: error.message };
    } else {
        return {}; // return email in auth/confirm link as a search param
    }
};
