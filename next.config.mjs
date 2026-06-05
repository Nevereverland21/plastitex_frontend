import webpack from 'webpack';

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

    const externals = ['onnxruntime-web', '@imgly/background-removal'];

    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        ...externals,
      ];
    } else {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^onnxruntime-web$/,
        })
      );
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      os: false,
    };

    return config;
  },
};

export default nextConfig;