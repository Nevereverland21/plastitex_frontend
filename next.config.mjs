/** @type {import('next').NextConfig} */

// Host donde se sirven las imágenes de media cuando se usa S3/CDN
// (ej. el bucket "mi-bucket.s3.us-east-1.amazonaws.com" o un CloudFront
// "cdn.plastitex.pe"). Se define en el .env del frontend como
// NEXT_PUBLIC_MEDIA_HOSTNAME. Si no está, solo se usan los hosts de abajo.
const mediaHostname = process.env.NEXT_PUBLIC_MEDIA_HOSTNAME;

const nextConfig = {
  images: {
    // Imágenes inmutables (nombre único por archivo): se pueden cachear largo.
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
    // El backend ya entrega WebP a ≤1600 px, así que no tiene sentido pedirle al
    // optimizador variantes gigantes (era hasta 3840) ni encodear AVIF (más lento
    // en el primer render). WebP + tamaños acotados = menos trabajo del servidor.
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      ...(mediaHostname
        ? [{ protocol: 'https', hostname: mediaHostname }]
        : []),
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