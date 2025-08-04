import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    productionBrowserSourceMaps: true,
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.dicebear.com",
                pathname: "/**",
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
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
        ];
    },
};

export default nextConfig;
