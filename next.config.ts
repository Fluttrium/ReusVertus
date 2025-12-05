import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Оптимизация для более быстрой разработки
  experimental: {
    // Оптимизация импортов пакетов
    optimizePackageImports: ['@prisma/client', 'react', 'react-dom', 'next-auth'],
  },
  // Оптимизация изображений (отключение для dev для ускорения)
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
