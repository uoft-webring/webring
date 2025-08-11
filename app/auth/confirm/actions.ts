"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const verifyToken = async (email: string, token: string) => {
    const supabase = await createClient();

    const authResponse = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: "email",
    });

    if (authResponse.error) {
        console.error(authResponse.error.code + " " + authResponse.error.message);
        return authResponse.error;
    } else {
        return redirect("/dashboard/edit"); // return email in auth/confirm link as a search param
    }
};

export const resendOtp = async (email: string) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            // emailRedirectTo: `${origin}/`,
        },
    });

    if (error) {
        console.error(error.code + " " + error.message);
    }
};

// Try to determine if the user has already been sent a confirmation email
export const canLoadPage = async (email: string) => {
    const supabase = await createAdminClient();

    // todo: use supabase rpc and call get_confirmation_sent postgres function
    const { data, error } = await supabase.from("users").select("updated_at").eq("email", email).single();

    if (error || !data) {
        console.log(error?.message || "No user found");
        return false;
    }

    const confirmationTimeStr = data.updated_at;
    if (!confirmationTimeStr) {
        return false;
    }

    const confirmationTime = new Date(confirmationTimeStr).getTime();
    const now = Date.now();

    // Add 20 minutes (in ms) to the confirmation time
    const expiryTime = confirmationTime + 20 * 60 * 1000;

    console.log("Confirmation time:", confirmationTime, "Now:", now, "Expiry time:", expiryTime);
    // T/F based on whether the current time is before the expiry time
    return now < expiryTime;
};
