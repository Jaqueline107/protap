/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Ignora erros de ESLint durante o build (útil para deploy na Vercel)
    ignoreDuringBuilds: true,
  },
  images: {
    // Permite carregar imagens de usuários do Google
    domains: ["lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
