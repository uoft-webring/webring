"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

/**
 * Handles Supabase auth callback flows.
 *
 * Two modes:
 * 1. Magic link interstitial: email links here with ?token_hash=...&type=...
 *    User clicks a button to verify the token. This prevents email
 *    prefetchers (e.g. Outlook Safe Links) from consuming the OTP token.
 *
 * 2. Post-verification callback: after Supabase verifies via implicit flow,
 *    it redirects here with hash fragment tokens. We extract them and
 *    establish a session.
 */
export default function AuthCallbackPage() {
    const [error, setError] = useState<string | null>(null);
    const [tokenHash, setTokenHash] = useState<string | null>(null);
    const [tokenType, setTokenType] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        // Mode 1: Magic link interstitial — show a button
        if (hash && type) {
            setTokenHash(hash);
            setTokenType(type);
            return;
        }

        // Mode 2: Post-verification callback
        handlePostVerification();
    }, []);

    const handleVerifyToken = async () => {
        if (!tokenHash || !tokenType) return;
        setVerifying(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: tokenType as "magiclink" | "email",
        });

        if (error) {
            setError(error.message);
            setVerifying(false);
            return;
        }

        window.location.href = "/dashboard/edit";
    };

    const handlePostVerification = async () => {
        const supabase = createClient();
        const searchParams = new URLSearchParams(window.location.search);

        const searchError = searchParams.get("error");
        const searchErrorDescription = searchParams.get("error_description");

        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const authError = hashParams.get("error");
        const authErrorDescription = hashParams.get("error_description");
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (searchError) {
            setError(searchErrorDescription ?? searchError);
            return;
        }

        if (authError) {
            setError(authErrorDescription ?? authError);
            return;
        }

        // Handle implicit flow: set session from hash fragment tokens
        if (accessToken && refreshToken) {
            const { error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (setSessionError) {
                setError(setSessionError.message);
                return;
            }
        }

        // Poll for session
        for (let attempt = 0; attempt < 10; attempt++) {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                if (/PKCE code verifier not found in storage/i.test(error.message)) {
                    await new Promise((resolve) => setTimeout(resolve, 250));
                    continue;
                }
                setError(error.message);
                return;
            }

            if (data.session) {
                window.location.href = "/dashboard/edit";
                return;
            }

            await new Promise((resolve) => setTimeout(resolve, 250));
        }

        setError("Unable to complete authentication. Please try again.");
    };

    // Mode 1: Magic link interstitial
    if (tokenHash && tokenType) {
        return (
            <div className="flex min-h-svh w-full items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="mb-2 text-2xl font-bold">Confirm Sign In</h1>
                    <p className="text-muted-foreground mb-4">
                        Click the button below to complete your sign in.
                    </p>
                    <button
                        onClick={handleVerifyToken}
                        disabled={verifying}
                        className="inline-block rounded-lg bg-blue-500 px-7 py-3.5 font-semibold text-white no-underline hover:bg-blue-600 disabled:opacity-50"
                    >
                        {verifying ? "Signing in..." : "Sign In to UofT Webring"}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                </div>
            </div>
        );
    }

    // Mode 2: Post-verification — loading or error
    if (error) {
        return (
            <div className="flex min-h-svh w-full items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="mb-2 text-2xl font-bold">Authentication Error</h1>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6">
            <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold">Signing you in...</h1>
                <p className="text-muted-foreground">Please wait while we complete authentication.</p>
            </div>
        </div>
    );
}
