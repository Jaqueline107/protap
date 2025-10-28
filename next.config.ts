/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "via.placeholder.com",
      "res.cloudinary.com", // necessário para imagens Cloudinary
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
