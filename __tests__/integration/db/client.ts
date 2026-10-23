import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Shared helpers for the read-only database tests. Nothing here writes; the tests only SELECT.
// Each test file is gated with describe.skipIf(!dbTestsEnabled()), so these helpers are never
// called (and never read env) unless SUPABASE_DB_TESTS=1 is set.

export function dbTestsEnabled(): boolean {
    return process.env.SUPABASE_DB_TESTS === "1";
}

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not set. Load .env before running the DB tests.`);
    return value;
}

// Refuse to run against anything that is not the local stack, so a stray env file can never point
// these reads at production.
function localUrl(): string {
    const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
    const host = new URL(url).hostname;
    if (host !== "127.0.0.1" && host !== "localhost") {
        throw new Error(`Refusing to run DB tests against non-local host "${host}".`);
    }
    return url;
}

const CLIENT_OPTIONS = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/** What a visitor's browser can do: the publishable/anon key, no session. */
export function anonClient(): SupabaseClient {
    return createClient(localUrl(), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), CLIENT_OPTIONS);
}

/**
 * Service-role client, used ONLY for SELECTs that the app itself performs server-side
 * (lib/profiles/queries.ts, lib/profiles/page.ts). Anon has no table grants on public.profile,
 * so shape and ring checks on real rows need this. It bypasses RLS and is never used for writes here.
 */
export function serviceReadClient(): SupabaseClient {
    return createClient(localUrl(), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), CLIENT_OPTIONS);
}
