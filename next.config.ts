import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  experimental: {
    proxyClientMaxBodySize: "200mb",
  },
};

export default nextConfig;
