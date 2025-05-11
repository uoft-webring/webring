"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const getCurrentUser = async () => {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (!error) {
        return user;
    } else {
        console.log(error.message);
    }
};

export const getUserInfo = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("profile").select("*");

    const name = data?.at(0)?.name;
    console.log(name);
    if (!error) {
        return name;
    } else {
        console.log(error.message);
    }
};

export const signOutAction = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/");
};
