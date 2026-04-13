"use server";
import { createAdminClient } from "@/utils/supabase/server";

export default async function domain_from_id(initialId: number, direction: "next" | "prev") {
    const supabase = createAdminClient();
    const isNext = direction === "next";

    // Try to find the next/prev member with a valid domain in one query.
    // For "next": find the smallest ring_id > current with a domain.
    // For "prev": find the largest ring_id < current with a domain.
    const { data } = await supabase
        .from("profile")
        .select("domain")
        .not("domain", "is", null)
        .neq("domain", "")
        [isNext ? "gt" : "lt"]("ring_id", initialId)
        .order("ring_id", { ascending: isNext })
        .limit(1)
        .single();

    if (data?.domain) {
        return data.domain;
    }

    // Wrap around: no result in that direction, so grab the first/last member in the ring.
    const { data: wrapData } = await supabase
        .from("profile")
        .select("domain")
        .not("domain", "is", null)
        .neq("domain", "")
        .order("ring_id", { ascending: isNext })
        .limit(1)
        .single();

    return wrapData?.domain ?? null;
}
