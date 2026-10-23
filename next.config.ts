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

export default nextConfig;
