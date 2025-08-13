/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  // Updated for Next.js 15
  serverExternalPackages: ["bcryptjs"],
  // Add experimental features for better error handling
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"],
  },
}

module.exports = nextConfig
