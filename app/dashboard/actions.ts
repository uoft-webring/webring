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

export const signOutAction = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/join");
};
