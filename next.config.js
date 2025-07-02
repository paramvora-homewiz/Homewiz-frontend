/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  // Disable all type checking and linting for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Basic settings for stability
  reactStrictMode: false,
  
  // Force asset regeneration to fix 404 issues
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },

  // Configure asset prefix for development
  assetPrefix: process.env.NODE_ENV === 'development' ? '' : undefined,

  // Webpack configuration for chunk loading stability and WebSocket support
  webpack: (config, { dev, isServer }) => {
    // Handle WebSocket dependencies for Supabase realtime
    config.resolve.fallback = {
      ...config.resolve.fallback,
      bufferutil: false,
      'utf-8-validate': false,
    }

    if (dev && !isServer) {
      // Increase chunk loading timeout
      config.output.chunkLoadTimeout = 30000

      // Optimize chunk splitting for development
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || 'false',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
}

module.exports = nextConfig
