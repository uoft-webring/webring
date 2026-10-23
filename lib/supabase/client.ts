import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// createBrowserClient returns a per-tab singleton, so calling this repeatedly is cheap.
export function createClient(): SupabaseClient {
    return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: {
            // Magic links land on /auth/callback with tokens in the hash; we parse them manually there.
            flowType: "implicit",
            detectSessionInUrl: false,
        },
    });
}
