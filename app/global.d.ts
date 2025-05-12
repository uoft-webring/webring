// extending nodejs's env to typescript

namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_SUPABASE_URL: string;
        NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
        NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: string;
    }
}
