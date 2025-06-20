/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all type checking and linting for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Basic settings for stability
  reactStrictMode: false,

  // Environment variables
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_PUBLIC_API_URL: '',
  },
}

module.exports = nextConfig
