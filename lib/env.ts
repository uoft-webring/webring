import "server-only";
import { z } from "zod";

// `KEY=` in a .env file arrives as "": treat it as unset instead of failing every request
const optionalString = z.preprocess((value) => (value === "" ? undefined : value), z.string().min(1).optional());

const serverEnvSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    NEXT_PUBLIC_HOME_DOMAIN: z.url(),
    DOMAIN_VALIDATION_SECRET_KEY: z.string().min(1),
    REVALIDATION_SECRET_TOKEN: optionalString,
    // Shared with the GitHub Actions that call /api/cron/*
    CRON_SECRET: optionalString,
    // Comma-separated emails allowed to use /admin/ring (the ring review queue)
    ADMIN_EMAILS: optionalString,
    AWS_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_S3_BUCKET_NAME: z.string().min(1),
    VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
    VERCEL_URL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

// Parsed lazily so `next build` doesn't need every secret just to compile pages.
export function serverEnv(): ServerEnv {
    cached ??= serverEnvSchema.parse(process.env);
    return cached;
}

/** Absolute URL on this deployment (preview deployments link back to themselves). */
export function siteUrl(path = "/"): string {
    const env = serverEnv();
    const base = env.VERCEL_ENV === "preview" && env.VERCEL_URL ? `https://${env.VERCEL_URL}` : env.NEXT_PUBLIC_HOME_DOMAIN;
    return new URL(path, base).toString();
}
