import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // パフォーマンス最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // 最小化とコード分割
  webpack: (config, { dev, isServer }) => {
    // 本番環境での最適化
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        usedExports: true,
      };
    }
    
    return config;
  },
  
  // 実験的な最適化機能（安定版のみ）
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-slot",
      "class-variance-authority",
      "clsx",
      "tailwind-merge"
    ],
  },
  
  // 本番環境でのソースマップ無効化
  productionBrowserSourceMaps: false,
  
  // 圧縮設定
  compress: true,
  
  // 画像最適化
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // キャッシュ最適化
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
