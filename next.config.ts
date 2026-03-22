import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/voice-app',
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
