import type { Instrumentation } from "next";

/** Reports server-side render/route/action errors to PostHog. Visitors only ever see app/error.tsx. */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || process.env.NEXT_RUNTIME !== "nodejs") return;

    // Imported lazily (and not via lib/posthog-server, which is server-only for the RSC layer)
    const { PostHog } = await import("posthog-node");
    const client = new PostHog(key, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST, flushAt: 1, flushInterval: 0 });
    client.captureException(error, "server", {
        path: request.path,
        method: request.method,
        route: context.routePath,
        route_type: context.routeType,
        digest: typeof error === "object" && error && "digest" in error ? String(error.digest) : undefined,
    });
    await client.shutdown();
};
