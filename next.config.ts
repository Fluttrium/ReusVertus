import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@prisma/client', 'react', 'react-dom', 'next-auth'],
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
};

export default nextConfig;