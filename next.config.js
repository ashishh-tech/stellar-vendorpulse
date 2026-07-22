/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      os: false,
      url: false,
    };
    return config;
  },
  serverActions: {
    bodySizeLimit: '2mb',
  },
};

module.exports = nextConfig;
