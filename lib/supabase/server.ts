import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";

/** Request-scoped client that acts as the signed-in user (RLS applies). */
export async function createClient() {
    const cookieStore = await cookies();
    const env = serverEnv();

    return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // Server Components can't write cookies; proxy.ts refreshes the session instead.
                }
            },
        },
    });
}

/** Stateless anon client for auth calls that must not touch the caller's session (e.g. sending OTPs). */
export function createAnonClient() {
    const env = serverEnv();
    return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, flowType: "implicit" },
    });
}

/** Service-role client. Bypasses RLS: only use for reads of public columns or writes the server has authorised. */
export function createAdminClient() {
    const env = serverEnv();
    return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
