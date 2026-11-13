"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setSubscription } from "./actions";

export function SubscriptionForm({ m, t, initiallySubscribed }: { m: string; t: string; initiallySubscribed: boolean }): React.JSX.Element {
    const [subscribed, setSubscribed] = useState(initiallySubscribed);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const choose = (next: boolean) => {
        startTransition(async () => {
            setError(null);
            const result = await setSubscription({ m, t, subscribed: next });
            if (result.error !== null) {
                setError(result.error);
                return;
            }
            setSubscribed(result.data.subscribed);
        });
    };

    return (
        <div className="space-y-4">
            <p aria-live="polite">
                {subscribed
                    ? "You're getting emails from the UofT Webring team: news, ring updates and the odd heads-up about your site."
                    : "You're unsubscribed. The UofT Webring team won't email you about the ring. Sign-in emails still arrive when you ask for them."}
            </p>
            <Button type="button" variant={subscribed ? "default" : "secondary"} disabled={pending} onClick={() => choose(!subscribed)}>
                {pending ? "Saving…" : subscribed ? "Unsubscribe" : "Subscribe again"}
            </Button>
            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}
