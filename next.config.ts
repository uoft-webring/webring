import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
    extension: /\.mdx?$/,
});

const cloudfrontDomain = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN;
if (!cloudfrontDomain) {
    throw new Error("Missing env var: NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN");
}
const nextConfig: NextConfig = {
    pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
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
            {
                source: "/:all*(svg|jpg|png|css|js|woff2)",
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
                hostname: cloudfrontDomain,
                pathname: "/**",
                //port: "",
                //search: "",
            },
        ],
    },
};

export default withMDX(nextConfig);
