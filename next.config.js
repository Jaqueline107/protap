/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['protapcars.vercel.app', 'firebasestorage.googleapis.com'], // adicione todos os domínios que você vai usar
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
