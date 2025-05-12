import { createClient } from "@supabase/supabase-js";

// Making a supabase client for interacting with the db using JS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;
