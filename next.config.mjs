/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable static page generation during build to avoid SSR issues with browser APIs
  ...(process.env.NODE_ENV === 'production' && {
    generateBuildId: async () => {
      return 'build-' + Date.now();
    },
  }),
  typescript: {
    // Skip type checking during build - run separately via type-check command
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build - run separately via lint command
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
