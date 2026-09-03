import type { NextConfig } from "next";

const developmentApiSources = "http://localhost:3001 http://localhost:3002 http://127.0.0.1:3001 http://127.0.0.1:3002";
const apiSources = process.env.NODE_ENV === "production"
  ? "https://*.up.railway.app"
  : `${developmentApiSources} https://*.up.railway.app`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" },
          { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob: https://res.cloudinary.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ${apiSources} https://api.cloudinary.com; font-src 'self' data:;` },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
