"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AuthChangeEvent } from "@supabase/supabase-js";
import posthog from "posthog-js";
import { posthogIdentifyUser } from "@/utils/posthog";

export default function PosthogIdentityProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
            api_host: "/relay-OyIr",
            ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            persistence: "localStorage+cookie",
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

    return <>{children}</>;
}
