/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: "/transactions", destination: "/", permanent: false }]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    unoptimized: true,
  },
  serverExternalPackages: ["bcryptjs"],
}

module.exports = nextConfig
