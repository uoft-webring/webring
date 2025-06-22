import { SupabaseClient } from "@supabase/supabase-js";
// import { createClient } from "@supabase/supabase-js";
import { createAdminClient, SupabaseClient } from "@/utils/supabase/server";
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/../../../.env.local" });

// const getSupabase = async () => {
//     const supabase = await createAdminClient();
//     return supabase;
// };

// const supabase = getSupabase();

async function seed_users_random(index, supabase) {
    const supabase = await createAdminClient();
    const name = `user${index}`; // generate random
    const email = `${name}@mail.utoronto.ca`;
    const domain = `https://${name}.com`;

    await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            data: {
                //  attach user metadata
                name: name,
                domain: domain,
            },
        },
    });
}

for (let i = 0; i < parseInt(process.argv[2]); i++) {
    seed_users_random(i, supabase);
}
