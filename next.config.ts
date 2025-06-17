import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    devIndicators: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
