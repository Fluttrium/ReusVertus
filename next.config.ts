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
  // Отключение некоторых проверок для ускорения dev режима
  typescript: {
    // В dev режиме не проверяем типы при сборке (проверка только в IDE)
    ignoreBuildErrors: true,
  },
  eslint: {
    // В dev режиме не проверяем ESLint при сборке
    ignoreDuringBuilds: true,
  },
  // Ускорение компиляции
  swcMinify: true,
  // Отключение source maps в dev для ускорения
  productionBrowserSourceMaps: false,
};

export default nextConfig;
