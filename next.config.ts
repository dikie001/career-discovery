import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // PWA is configured via custom service worker and manifest
  // See public/sw.js and public/manifest.json
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
}

export default nextConfig
