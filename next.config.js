/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages configuration
  basePath: process.env.NODE_ENV === 'production' ? '/ClicWriter' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ClicWriter/' : '',
}

module.exports = nextConfig