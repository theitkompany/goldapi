import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App Router is enabled by default in Next.js 13+
  // TypeScript type-checking is handled by the build pipeline
  images: {
    // Allow optimisation for external domains if needed in future
    remotePatterns: [],
    // Enable image size optimisation
    formats: ["image/avif", "image/webp"],
  },
  // Enable strict mode for React
  reactStrictMode: true,
};

export default nextConfig;
