import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    proxyClientMaxBodySize: "200mb",
  },
};

export default nextConfig;
