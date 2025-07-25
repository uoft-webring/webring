import { createAdminClient } from "@/utils/supabase/server";
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/../../../.env.local" });

// const getSupabase = async () => {
//     const supabase = await createAdminClient();
//     return supabase;
// };

// const supabase = getSupabase();

const supabase = createAdminClient();

async function seed_users_random(index: number) {
    const name = `user${index}`; // generate random
    const email = `${name}@mail.utoronto.ca`;
    const domain = `https://${name}.com`;

    await supabase.auth.signUp({
        email,
        password: name,
        options: {
            data: {
                //  attach user metadata
                name: name,
                domain: domain,
            },
        },
    });
}

async function seed() {
    for (let i = 0; i < parseInt(process.argv[2]); i++) {
        await seed_users_random(i); // remember to await
    }
}

seed();
