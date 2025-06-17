"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserType } from "@/utils/zod";
import { User } from "@supabase/supabase-js";

export const getCurrentUser = async () => {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    return { user, error };
};

export const getUserInfo = async () => {
    const supabase = await createClient();
    const { user: authUser, error } = await getCurrentUser();
    if (!authUser) {
        redirect("/signup");
    }

    const { data: userData, error: dataError } = await supabase
        .from("profile")
        .select("*")
        .eq("id", authUser.id);
    return {
        data: userData?.at(0) as UserType,
        error: dataError,
    };
};

export const signOutAction = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/");
};
