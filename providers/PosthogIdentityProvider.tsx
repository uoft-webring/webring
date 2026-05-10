"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { createClient } from "@/lib/supabase/client";

/** Ties PostHog's anonymous visitor to the Supabase user once they sign in. */
export function PosthogIdentityProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
    useEffect(() => {
        const { data } = createClient().auth.onAuthStateChange((event, session) => {
            if (session) {
                posthog.identify(session.user.id, {
                    email: session.user.email,
                    name: session.user.user_metadata.name,
                });
            } else if (event === "SIGNED_OUT") {
                posthog.reset();
            }
        });
        return () => data.subscription.unsubscribe();
    }, []);

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
