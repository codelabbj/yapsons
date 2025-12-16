import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  images: {
    remotePatterns: [
      // Removed api.yapson.net since domain is not resolving
      // Add other image domains as needed
    ],
  },
  // Add experimental features to improve chunk loading
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-i18next'],
  },
  // Use webpack explicitly to maintain compatibility with existing webpack config
  webpack: (config, { dev, isServer }) => {
    // Optimize chunk splitting for production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
          },
        },
      };

      // Improve chunk loading reliability
      config.optimization.runtimeChunk = 'single';
    }

    return config;
  },
  // Add output configuration for better chunk handling
  output: 'standalone',
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  // Add compression for better performance
  compress: true,
};

export default nextConfig;
