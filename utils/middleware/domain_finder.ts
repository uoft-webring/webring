import { createAdminClient } from "@/utils/supabase/server";
import random_domain from "@/utils/middleware/random_query";
import query from "@/utils/middleware/query_db";

export default async function domain_from_id(index: number) {
    // querying db "profile" for "domain" whose row id is "index"
    const supabase = await createAdminClient();

    // get number of rows in db
    const { count } = await supabase
        .from("profile")
        .select("ring_id", { count: "exact", head: true });

    // check if count and then check if the user is the final user in the db
    // if yes, we redirect to first domain
    if (count != null && count == index) {
        const first_domain = query(supabase, 0);

        // checks if first_domain is an error or undefined
        if (first_domain) {
            console.log(
                "Error fetching first domain in database",
                first_domain
            );
            // if first_domain raises an error, return random domain
            return random_domain(supabase, count) ?? null;
        }

        return first_domain ?? null;
    }

    // if index is <0 i.e going back on first user
    if (count != null && index < 0) {
        // query last domain
        const last_domain = query(supabase, count - 1);

        // checks if last _domain is an error or undefined
        if (last_domain) {
            console.log("Error fetching first domain in database", last_domain);
            // if last_domain raises an error, return random domain
            return random_domain(supabase, count) ?? null;
        }

        return last_domain ?? null;
    }

    // get domain based on index
    const domain = query(supabase, index);

    // if both are null return null
    if (count == null && domain) {
        console.log(
            "Error in fetching: both domain and count raise errors",
            domain,
            count
        );
        return null;
    }

    // return random domain if domain not defined but count is defined
    if (count != null && domain) {
        console.log("Error fetching domain", domain);
        return random_domain(supabase, count) ?? null;
    }

    // return null if domain is not defined and count is not defined
    if (domain) {
        console.log("Error fetching domain", domain);
        return null;
    }

    return domain ?? null;
}
