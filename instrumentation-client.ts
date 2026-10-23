import posthog from "posthog-js";

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: "/relay-OyIr",
        ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        defaults: "2025-05-24",
        capture_exceptions: true,
        person_profiles: "always",
        persistence: "localStorage+cookie",
        request_batching: true,
        // By default its loader scripts go before the first <body> script, which is the root layout's
        // JSON-LD, so React's hydration matches against the wrong <script> and logs a mismatch
        external_scripts_inject_target: "head",
        debug: process.env.NODE_ENV === "development",
    });
}
