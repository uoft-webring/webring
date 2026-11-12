import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";

const cloudfrontDomain = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN;
if (!cloudfrontDomain) {
    throw new Error("Missing env var: NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN");
}

// Only directives that can't break rendering. A script-src policy would need per-request nonces,
// which forces every page dynamic (the root layout must stay static), and would have to track
// PostHog and the 3D scene's runtime-loaded font and workers.
const contentSecurityPolicy = [
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
].join("; ");

const securityHeaders = [
    { key: "Content-Security-Policy", value: contentSecurityPolicy },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
    reactStrictMode: true,
    reactCompiler: true,
    poweredByHeader: false,
    logging: {
        fetches: {
            fullUrl: true,
            hmrRefreshes: true,
        },
    },
    async headers() {
        return [
            { source: "/:path*", headers: securityHeaders },
            {
                source: "/:all*(svg|jpg|png|woff2|avif)",
                headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
        ];
    },
    images: {
        remotePatterns: [{ protocol: "https", hostname: cloudfrontDomain, pathname: "/**" }],
        formats: ["image/avif", "image/webp"],
    },
    async rewrites() {
        return [
            {
                source: "/relay-OyIr/static/:path*",
                destination: "https://us-assets.i.posthog.com/static/:path*",
            },
            {
                source: "/relay-OyIr/:path*",
                destination: "https://us.i.posthog.com/:path*",
            },
        ];
    },
    // Required for PostHog's trailing-slash API requests through the relay
    skipTrailingSlashRedirect: true,
};

const posthogPersonalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;

// Uploads source maps to PostHog so error stack traces read as source, not minified chunks. Only builds
// with the key (Vercel production) upload; elsewhere the build is unchanged. Maps are deleted after
// upload so they're never served publicly.
// withPostHogConfig's types say NextConfig, but it returns Next's (phase, ctx) config function
const withPostHog = withPostHogConfig(nextConfig, {
    personalApiKey: posthogPersonalApiKey ?? "",
    projectId: "419642",
    host: "https://us.posthog.com",
    sourcemaps: {
        enabled: Boolean(posthogPersonalApiKey),
        deleteAfterUpload: true,
    },
}) as unknown as (phase: string, ctx: { defaultConfig: NextConfig }) => Promise<NextConfig>;

// An analytics side task must never block a deploy: under Turbopack the plugin fails the build on any
// upload error (PostHog down, key revoked), so a failure only logs and the build carries on.
export default async function config(phase: string, ctx: { defaultConfig: NextConfig }): Promise<NextConfig> {
    let withUpload: NextConfig;
    try {
        withUpload = await withPostHog(phase, ctx);
    } catch (error) {
        console.warn("[posthog] Source map setup failed; building without upload.", error);
        return nextConfig;
    }
    const upload = withUpload.compiler?.runAfterProductionCompile;
    if (!upload) return withUpload;
    return {
        ...withUpload,
        compiler: {
            ...withUpload.compiler,
            runAfterProductionCompile: async (...args) => {
                try {
                    await upload(...args);
                } catch (error) {
                    console.warn("[posthog] Source map upload failed; deploying without it.", error);
                }
            },
        },
    };
}
