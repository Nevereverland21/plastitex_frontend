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
      // En el servidor: marcar como externos
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        'onnxruntime-web',
        '@imgly/background-removal',
      ];
    } else {
      // En el cliente: reemplazar con módulos vacíos
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-web': false,
        '@imgly/background-removal': false,
      };
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