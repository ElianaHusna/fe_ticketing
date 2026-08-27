import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.200.193"],

  async rewrites() {
    return [
      {
        source: "/backend/:path*",
destination:
  "http://192.168.200.193:3000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;   