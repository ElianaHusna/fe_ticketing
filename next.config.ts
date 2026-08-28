import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.190.139.32"],

  async rewrites() {
    return [
      {
        source: "/backend/:path*",
destination:
  "http://10.190.139.32:3000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;   