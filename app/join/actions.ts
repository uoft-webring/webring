"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString() || "";
    const name = formData.get("name")?.toString() || "";

    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    console.log(origin);

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            // emailRedirectTo: `${origin}/`,
        },
    });

    const { userData, userError } = await supabase
        .from("profile")
        .update({ name: name })
        .eq("email", email);

    if (error) {
        console.error(error.code + " " + error.message);
    } else {
        return redirect(`/auth/confirm?email=${email}`); // return email in auth/confirm link as a search param
    }
};

export const signInAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString() || "";

    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    console.log(origin);

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            // emailRedirectTo: `${origin}/`,
        },
    });

    if (error) {
        console.error(error.code + " " + error.message);
    } else {
        return redirect(`/auth/confirm?email=${email}`); // return email in auth/confirm link as a search param
    }
};

export const isEmailRegistered = async (email: string) => {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email);

    console.log("data", data?.length);
    if (error) {
        console.log(error.message);
    }

    return data?.length;
};
