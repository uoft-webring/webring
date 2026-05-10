// Creates N throwaway local users: `npx tsx supabase/seed/scripts/seed_users.ts 10`
// Talks to Supabase directly (not lib/supabase) because lib modules are server-only.
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: `${__dirname}/../../../.env` });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
if (!/^https?:\/\/(127\.0\.0\.1|localhost)[:/]/.test(url)) {
    throw new Error(`Refusing to seed a non-local database: ${url}`);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

async function seed(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
        const name = `user${i}`;
        const { error } = await supabase.auth.admin.createUser({
            email: `${name}@mail.utoronto.ca`,
            email_confirm: true,
            user_metadata: { name, domain: `https://${name}.com` },
        });
        if (error) console.error(`Failed to create ${name}:`, error.message);
    }
}

void seed(Number.parseInt(process.argv[2] ?? "10", 10));
