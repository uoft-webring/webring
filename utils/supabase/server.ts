// utils/supabase/server.ts
import {
    createClient as createSupabaseClient,
    SupabaseClient,
} from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient(): Promise<SupabaseClient> {
    let supabase: SupabaseClient;

    try {
        const cookieStore = await cookies(); // Await the promise

        supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                    storage: {
                        getItem: (key) => cookieStore.get(key)?.value || null,
                        setItem: (key, value) => {
                            cookieStore.set(key, value, {
                                maxAge: 60 * 60 * 24 * 7,
                                path: "/",
                                sameSite: "lax",
                                httpOnly: true,
                                secure: process.env.NODE_ENV === "production",
                            });
                        },
                        removeItem: (key) => {
                            cookieStore.delete(key);
                        },
                    },
                },
            }
        );
    } catch (e) {
        // If cookies() throws, create a client *without the auth options*.
        // This client can still perform public data fetches.
        console.warn(
            "Cookies not available, creating a public Supabase client. This is expected during static builds:",
            e
        );
        supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            // No third argument (options) here, so 'auth' will be default/non-configured
        );
    }
    return supabase;
}

export function createAdminClient(): SupabaseClient {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    );
}
