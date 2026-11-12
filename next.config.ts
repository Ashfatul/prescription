import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["prescription.test", "*.prescription.test"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
