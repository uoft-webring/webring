import type { Metadata } from "next";
import { AuthCallback } from "./AuthCallback";

export const metadata: Metadata = { title: "Signing in", robots: { index: false } };

/**
 * Supabase auth callback, two modes:
 * 1. Magic-link interstitial (?token_hash=&type=): the user clicks to verify, so email link
 *    scanners (e.g. Outlook Safe Links) can't consume the one-time token by prefetching it.
 * 2. Implicit-flow return: tokens arrive in the URL hash, which only the browser can read.
 */
export default async function AuthCallbackPage({ searchParams }: PageProps<"/auth/callback">) {
    const params = await searchParams;
    const tokenHash = typeof params.token_hash === "string" ? params.token_hash : null;
    const type = params.type === "magiclink" || params.type === "email" ? params.type : null;
    const error = typeof params.error_description === "string" ? params.error_description : null;

    return <AuthCallback tokenHash={type ? tokenHash : null} type={type} initialError={error} />;
}
