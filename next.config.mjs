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
  webpack: (config, {  }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    // Decirle a webpack que trate estos paquetes como externos en ambos lados
    const libs = ['onnxruntime-web', '@imgly/background-removal'];

    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      ...libs,
    ];

    // Regla para que webpack no intente parsear estos archivos
    config.module.rules.push({
      test: /node_modules\/(onnxruntime-web|@imgly\/background-removal)\/.*/,
      use: 'null-loader',
    });

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