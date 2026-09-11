import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingIncludes: {
    "api/**/*": ["./node_modules/**/*"],
  },
};

export default nextConfig;
