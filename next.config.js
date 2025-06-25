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

  // Webpack configuration for chunk loading stability
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Increase chunk loading timeout
      config.output.chunkLoadTimeout = 30000

      // Optimize chunk splitting
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
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Proxy API calls to backend to avoid CORS issues
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return [
      {
        source: '/operators/:path*',
        destination: `${backendUrl}/operators/:path*`,
      },
      {
        source: '/buildings/:path*',
        destination: `${backendUrl}/buildings/:path*`,
      },
      {
        source: '/rooms/:path*',
        destination: `${backendUrl}/rooms/:path*`,
      },
      {
        source: '/tenants/:path*',
        destination: `${backendUrl}/tenants/:path*`,
      },
      {
        source: '/leads/:path*',
        destination: `${backendUrl}/leads/:path*`,
      },
      {
        source: '/analytics/:path*',
        destination: `${backendUrl}/analytics/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
