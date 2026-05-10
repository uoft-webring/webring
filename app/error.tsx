"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { ErrorScreen } from "@/components/ErrorScreen";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        // Report it, but never show the message: it can leak internals and means nothing to visitors
        posthog.captureException(error, { digest: error.digest });
    }, [error]);

    return (
        <ErrorScreen
            code="500"
            eyebrow="Something went wrong"
            title="The ring hit a snag."
            description="That's on us, not you. Try again, or head back home while we look into it."
            onRetry={reset}
        />
    );
}
