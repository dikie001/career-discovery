import type { NextConfig } from "next"
import withPWA from "next-pwa"

const nextConfig: NextConfig = withPWA({
    dest: "public",
    disable: process.env.NODE_ENV !== "production",
    register: false, // We'll register manually with our custom service worker
    skipWaiting: true,
    reloadOnOnline: true,
})

export default nextConfig
