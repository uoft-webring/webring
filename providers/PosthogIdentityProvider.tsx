"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";
import { posthogIdentifyUser } from "@/utils/posthog";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export default function PosthogIdentityProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const supabase = createClient();
        const { data } = supabase.auth.onAuthStateChange((_, session) => {
            if (session) {
                posthogIdentifyUser({
                    email: session.user.email!,
                    name: session.user.user_metadata.name,
                    userId: session.user.id,
                });
            }
        });

        return () => {
            data.subscription.unsubscribe();
        };
    }, []);

    return <PHProvider client={posthog}>{children}</PHProvider>;
}
