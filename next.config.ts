/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Ignora erros de ESLint durante build
  },
  images: {
    domains: [
      "lh3.googleusercontent.com", // Para avatars do Google
      "via.placeholder.com",       // Caso queira imagens placeholder
    ],
    formats: ["image/avif", "image/webp"], // Otimização automática de formatos
  },
  experimental: {
    appDir: true, // Certifica que App Router está ativado
  },
};

module.exports = nextConfig;
