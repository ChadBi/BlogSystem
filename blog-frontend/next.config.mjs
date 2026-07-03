const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
const directusHost = new URL(directusUrl).hostname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: directusHost,
        pathname: '/assets/**',
      },
      {
        protocol: 'http',
        hostname: directusHost,
        pathname: '/assets/**',
      },
    ],
  },
};

export default nextConfig;
