import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        unoptimized: true,
    },
    // Desktop runs Next over http://127.0.0.1 — relative assetPrefix breaks the server.
    assetPrefix: process.env.MATDEV_DESKTOP_BUILD === "1" ? undefined : "",
    trailingSlash: true,
}

export default nextConfig
