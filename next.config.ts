import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
    extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
    pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
    productionBrowserSourceMaps: true,
    reactStrictMode: true,
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

export default withMDX(nextConfig);
