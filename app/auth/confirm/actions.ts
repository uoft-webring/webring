"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import { queryRateLimit } from "@/app/rateLimiter";

const minutes_to_ms = 60 * 1000;

export const verifyToken = async (email: string, token: string) => {
    // const token = formData.get("token")?.toString();
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

export const resendMagicLink = async (email: string) => {
    const supabase = await createClient();

    const { error: RateLimitError } = await queryRateLimit(email);
    if (RateLimitError) {
        return { error: RateLimitError };
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            // emailRedirectTo: `${origin}/`,
        },
    });

    if (error) {
        return { error };
    }

    return {};
};

// TODO: decide on how much time to allow users to be able to enter code for
export const canLoadPage = async (email: string) => {
    const supabase = await createAdminClient();

    // todo: use supabase rpc and call get_confirmation_sent postgres function
    const { data, error } = await supabase.from("users").select("updated_at").eq("email", email);

    if (error) {
        console.log(error.message);
    }
    const confirmation_time = data?.at(0)?.updated_at;
    console.log(confirmation_time);
    if (!confirmation_time) {
        return false;
    }

    console.log("conf time", confirmation_time);
    // TODO dayjs causes hydration errors in dev
    const m_time = dayjs(confirmation_time);
    m_time.add(20, "minute"); //  change this to minutes later
    // console.log(dayjs());
    console.log("difference", dayjs().diff(m_time));
    if (dayjs().diff(m_time) < 20 * minutes_to_ms) {
        return true;
    }

    return false;
};
