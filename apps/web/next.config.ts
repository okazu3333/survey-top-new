import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // 開発時のパフォーマンス向上
  poweredByHeader: false,
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
