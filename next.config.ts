import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '**',
      },
    ],
  },
  experimental: {
    reactCompiler: true,
  },
  serverExternalPackages: ['ably'],
};

export default nextConfig;
