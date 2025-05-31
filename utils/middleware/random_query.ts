import { SupabaseClient } from "@supabase/supabase-js";

export default async function random_domain(
    supabase: SupabaseClient,
    length: number
) {
    // get a random integer between 0 and (length - 1)
    const random_index = Math.floor(Math.random() * (length - 1));

    // get domain based on random index
    const { data, error } = await supabase
        .from("profile")
        .select("domain")
        .eq("ring_id", random_index)
        .single();

    if (error) {
        console.log("Error fetching domain", error);
        return null;
    }

    return data?.domain ?? null;
}
