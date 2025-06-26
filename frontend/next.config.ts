import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    '192.168.100.188',
    'localhost',
    '127.0.0.1'
  ]
};

export default nextConfig;
