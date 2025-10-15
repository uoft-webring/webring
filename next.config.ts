import type { NextConfig } from "next";

const cloudfrontDomain = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN;
if (!cloudfrontDomain) {
    throw new Error("Missing env var: NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN");
}
const nextConfig: NextConfig = {
    pageExtensions: ["js", "jsx", "ts", "tsx"],
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    poweredByHeader: false,
    async headers() {
        return [
            {
                source: "/:path*{/}?",
                headers: [
                    {
                        key: "X-Accel-Buffering",
                        value: "no",
                    },
                ],
            },
            {
                source: "/:all*(svg|jpg|png|css|js|woff2|avif)$",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "d37ovd1colvcou.cloudfront.net", //cloudfrontDomain,
                pathname: "/**",
            },
        ],
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
    // This is required to support PostHog trailing slash API requests
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
