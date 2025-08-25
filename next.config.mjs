import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

const nextConfig = {
  // 性能优化配置
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@headlessui/react', '@heroicons/react']
  },
  
  // 图片优化配置
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 压缩优化
  compress: true,
  
  // 静态优化
  trailingSlash: false,
  poweredByHeader: false,
};

export default nextConfig;