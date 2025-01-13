/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: '/ai-content-remixer',
  assetPrefix: '/ai-content-remixer/',
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig 