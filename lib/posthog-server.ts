import "server-only";
import { PostHog } from "posthog-node";

let client: PostHog | null = null;

type Capture = Parameters<PostHog["capture"]>[0];

/** Server-side capture. A no-op without a key, so local runs never pollute production analytics. */
export function getPostHogClient(): { capture: (event: Capture) => void } {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return { capture: () => {} };

    // flushAt 1: serverless instances may freeze right after the response, so don't batch
    client ??= new PostHog(key, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST, flushAt: 1, flushInterval: 0 });
    return client;
}
