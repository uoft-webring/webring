"use server";

import { createClient } from "@/utils/supabase/server";

export const signInAction = async (email: string) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
            emailRedirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : process.env.NEXT_PUBLIC_HOME_DOMAIN}/auth/callback`,
        },
    });

    if (error) return { error };

    return {}; // return email in auth/confirm link as a search param
};
