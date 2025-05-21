"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserType } from "@/utils/zod";

export const getCurrentUser = async () => {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    // if (!error) {
    //     return user;
    // } else {
    //     console.log(error.message);
    // }

    return { user, error };
};

export const getUserInfo = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("profile").select("*");

    /* const name = data?.at(0)?.name;
    console.log(name);
    if (!error) {
        return name;
    } else {
        console.log(error.message);
    } */

    // const user = data ? data[0] : data;
    const user: UserType = {
        domain: "https://asdasd.com",
        isVerified: true,
        image_url:
            "https://mohammadanwar.dev/_next/static/media/mohammad.6ef25c26.jpg",
        tagline:
            "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iure ratione, placeat voluptatem, modi expedita odio temporibus maiores neque enim nesciunt quod sunt. Quod, dolores reiciendis?",
        email: "aman.meherally@mail.utoronto.ca",
        id: "375163b0-886e-474c-85ce-6a197d286ccf",
        name: "Aman Meherally",
        github_url: "https://asdasd.com",
        tags: ["TypeScript", "React", "JavaScript"],
    };

    return { user, error };
};

export const signOutAction = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/");
};
