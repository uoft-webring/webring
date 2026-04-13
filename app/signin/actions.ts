"use server";

import { createAdminClient } from "@/utils/supabase/server";

export const signInAction = async (email: string) => {
    const supabase = createAdminClient();

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
            emailRedirectTo: `${process.env.VERCEL_ENV === "preview" ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_HOME_DOMAIN}/auth/callback`,
        },
    });

    if (error) return { error };

    return {}; // return email in auth/confirm link as a search param
};
