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
  serverExternalPackages: ["bcryptjs"],
  webpack: (config, { dev }) => {
    if (dev) {
      // v0 file syncs can overlap webpack recompiles and leave stale chunk manifests.
      // Disable the persistent dev cache so every compilation has a consistent chunk graph.
      config.cache = false
    }
    return config
  },
}

module.exports = nextConfig
