import { createAdminClient } from "@/utils/supabase/server";

export default async function domain_from_id(index: number) {
    // querying db "profile" for "domain" whose row id is "index"
    const supabase = await createAdminClient();
    console.log("incoming num", index);
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
