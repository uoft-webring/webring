import { SupabaseClient } from "@supabase/supabase-js";

export default async function query(supabase: SupabaseClient, index: number) {
    const { data, error } = await supabase
        .from("profile")
        .select("domain")
        .eq("ring_id", index)
        .single();

    if (error) {
        console.log("Error fetching domain", error);
        return null;
    }

    return data?.domain ?? null;
}
