const mediaHostname = process.env.NEXT_PUBLIC_MEDIA_HOSTNAME;

  const nextConfig = {
    images: {
      minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
      formats: ['image/webp'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1600],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      remotePatterns: [
        ...(mediaHostname ? [{ protocol: 'https', hostname: mediaHostname }] : []),
        { protocol: 'https', hostname: 'api.plastitex.pe' },
        { protocol: 'http', hostname: 'localhost', port: '8001' },
        { protocol: 'https', hostname: 'images.unsplash.com' },
      ],
    },
    webpack: (config, { isServer }) => {
      config.experiments = { ...config.experiments, asyncWebAssembly: true };
      if (isServer) {
        config.externals = [
          ...(Array.isArray(config.externals) ? config.externals : []),
          'onnxruntime-web',
          '@imgly/background-removal',
        ];
      } else {
        config.resolve.alias = {
          ...config.resolve.alias,
          'onnxruntime-web': false,
          '@imgly/background-removal': false,
        };
      }
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, path: false, crypto: false, os: false,
      };
      return config;
    },
  };

  export default nextConfig;