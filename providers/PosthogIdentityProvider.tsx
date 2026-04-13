"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";
import { posthogIdentifyUser } from "@/utils/posthog";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export default function PosthogIdentityProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        if (!key || process.env.NODE_ENV === "development") return;

        posthog.init(key, {
            api_host: "/relay-OyIr",
            ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            defaults: "2025-05-24",
            person_profiles: "always",
            persistence: "localStorage+cookie",
            request_batching: true,
        });

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
