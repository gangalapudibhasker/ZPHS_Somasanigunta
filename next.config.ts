import type { NextConfig } from "next";

const isGhPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGhPages
    ? {
        output: "export",
        basePath: "/ZPHS_Somasanigunta",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  allowedDevOrigins: ["192.168.0.101", "192.168.0.106", "192.168.0.*", "localhost", "127.0.0.1"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;


