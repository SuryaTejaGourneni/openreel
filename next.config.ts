import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "archive.org" }, { protocol: "https", hostname: "**.archive.org" }],
  },
};

export default nextConfig;
