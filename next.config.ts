import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "suhifotovmsdunwrliya.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
