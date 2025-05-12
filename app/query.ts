import supabase from "./db_client";

export default async function domain_from_id(index: number) {
    // querying db "profile" for "domain" whose row id is "index"
    const { data, error } = await supabase
        .from("profile")
        .select("domain")
        .eq("id", index)
        .single();

    if (error) {
        console.log("Error fetching domain", error);
        return null;
    }

    return data?.domain ?? null;
}
