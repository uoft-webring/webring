"use server";
import { createAdminClient } from "@/utils/supabase/server";

export default async function domain_from_id(initialId: number, direction: "next" | "prev") {
    // querying db "profile" for "domain" whose row id is "index"
    const supabase = createAdminClient();

    const findNextValidDomain = async (index: number, count: number, offset: number) => {
        for (let i = 1; i < Math.min(3, count); i++) {
            index = (index + offset + count - 1) % count;
            const { data, error } = await supabase
                .from("profile")
                .select("domain")
                .eq("ring_id", index)
                .single();

            if (data && !error && data.domain) {
                return data.domain;
            }
        }
    };

    // get number of rows in db
    const { count } = await supabase.from("profile").select("ring_id", { count: "exact", head: true });

    // make sure count is not null and initialId is in range of ids
    if (count == null || initialId < 0 || initialId >= count) {
        return null;
    }

    // change id depending on direction
    const offset = direction === "next" ? 1 : -1;
    const index = (initialId + offset + count) % count;

    // Get domain from database based on index
    const { data, error } = await supabase.from("profile").select("domain").eq("ring_id", index).single();

    if (!data || error) {
        return null;
    }

    if (!data.domain) {
        return findNextValidDomain(index, count, offset);
    }

    return data.domain ?? null;
}
