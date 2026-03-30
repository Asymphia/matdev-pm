import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    images: {
        unoptimized: true,
    },
    assetPrefix: process.env.NODE_ENV === "production" ? "./" : "",
    trailingSlash: true,
};

export default nextConfig;
