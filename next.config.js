/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.clerk.dev', 'img.clerk.com'],
  },
  // Enable source maps in production for better debugging
  productionBrowserSourceMaps: true,
}

module.exports = nextConfig
