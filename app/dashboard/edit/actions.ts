"use server";

import { createClient } from "@/utils/supabase/server";
import { UserType } from "@/utils/zod";
import { revalidatePath } from "next/cache";

export const saveData = async (formData: UserType) => {
    try {
        const supabase = await createClient();
        const result = await supabase
            .from("profile") // Replace with your table name
            .update({
                name: formData.name,
                github_url: formData.github_url,
                image_url: formData.image_url,
                is_verified: formData.is_verified,
                tagline: formData.tagline,
                tags: formData.tags,
                domain: formData.domain,
                program: formData.program,
                graduation_year: formData.graduation_year,
            })
            .eq("id", formData.id);

        if (!result.error) {
            revalidatePath("/");
        }

        return result;
    } catch (e) {
        return { error: "Network error" };
    }
};
