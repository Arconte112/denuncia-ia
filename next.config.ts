import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // @ts-ignore - Next.js 15 experimental options
  experimental: {
    serverExternalPackages: ['bcrypt']
  },
};

export default nextConfig;
