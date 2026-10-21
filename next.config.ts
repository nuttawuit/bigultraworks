import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true, // เปิดใช้งานเพื่อให้สอดคล้องกับหน้าเว็บและ Vercel
  },
};

export default nextConfig;