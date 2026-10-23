"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DASHBOARD = "/dashboard/edit";

function Shell({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6">
            <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold">{title}</h1>
                {children}
            </div>
        </div>
    );
}

async function sessionFromHash(): Promise<string | null> {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashError = hash.get("error_description") ?? hash.get("error");
    if (hashError) return hashError;

    const supabase = createClient();
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (!accessToken || !refreshToken) {
        // Already signed in (e.g. the link was opened twice): carry on
        const { data } = await supabase.auth.getSession();
        return data.session ? null : "Unable to complete authentication. Please try again.";
    }

    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    return error?.message ?? null;
}

export function AuthCallback({
    tokenHash,
    type,
    initialError,
}: {
    tokenHash: string | null;
    type: "magiclink" | "email" | null;
    initialError: string | null;
}): React.JSX.Element {
    const [error, setError] = useState<string | null>(initialError);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        if (tokenHash || initialError) return;
        // Mode 2: establish the session from the hash fragment, then leave
        let cancelled = false;
        void sessionFromHash().then((hashError) => {
            if (cancelled) return;
            if (hashError) setError(hashError);
            else window.location.replace(DASHBOARD);
        });
        return () => {
            cancelled = true;
        };
    }, [tokenHash, initialError]);

    const verifyToken = async () => {
        if (!tokenHash || !type) return;
        setVerifying(true);
        setError(null);
        const { error: verifyError } = await createClient().auth.verifyOtp({ token_hash: tokenHash, type });
        if (verifyError) {
            setError(verifyError.message);
            setVerifying(false);
            return;
        }
        // Full navigation so the server sees the new session cookie
        window.location.replace(DASHBOARD);
    };

    if (tokenHash) {
        return (
            <Shell title="Confirm Sign In">
                <p className="text-muted-foreground mb-4">Click the button below to complete your sign in.</p>
                <button
                    onClick={verifyToken}
                    disabled={verifying}
                    className="inline-block rounded-lg bg-blue-500 px-7 py-3.5 font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                >
                    {verifying ? "Signing in..." : "Sign In to UofT Webring"}
                </button>
                {error && (
                    <p role="alert" className="mt-4 text-sm text-red-500">
                        {error}
                    </p>
                )}
            </Shell>
        );
    }

    if (error) {
        return (
            <Shell title="Authentication Error">
                <p role="alert" className="text-muted-foreground">
                    {error}
                </p>
            </Shell>
        );
    }

    return (
        <Shell title="Signing you in...">
            <p className="text-muted-foreground">Please wait while we complete authentication.</p>
        </Shell>
    );
}
