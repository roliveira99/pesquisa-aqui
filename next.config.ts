import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/oficinas", destination: "/negocios", permanent: true },
      { source: "/oficinas/:slug", destination: "/negocios/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
