import { createAdminClient } from "@/utils/supabase/server";
import random_domain from "@/utils/middleware/random_query";
import query from "@/utils/middleware/query_db";

export default async function domain_from_id(
    initial_id: number,
    direction: string
) {
    // querying db "profile" for "domain" whose row id is "index"
    const supabase = await createAdminClient(); // TODO: check this later

    // get number of rows in db
    const { count } = await supabase
        .from("profile")
        .select("ring_id", { count: "exact", head: true });
    console.log("count", count);

    // make sure count is not null and initial_id is in range of ids
    if (count == null || !(0 <= initial_id && initial_id <= count - 1)) {
        return null;
    }

    // change id depending on direction
    const index = direction === "next" ? initial_id + 1 : initial_id - 1;

    // get domain based on index
    const domain = await query(supabase, (index + count) % count);
    // console.log("number", (index + count) % count);
    if (!domain) {
        return null;
    }

    return domain ?? null;
}
