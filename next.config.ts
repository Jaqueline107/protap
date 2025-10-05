/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🔥 Ignora erros de ESLint no build da Vercel
  },
};

module.exports = nextConfig;
