/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.plastitex.pe',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8001',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        '@imgly/background-removal',
        'onnxruntime-web',
      ];
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
      };
    }

    return config;
  },
};

export default nextConfig;