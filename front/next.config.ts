import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase = process.env.INTERNAL_API_URL || 'https://smartstore-api-w2s7.onrender.com';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
