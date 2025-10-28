/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "protapcars.vercel.app", // seu domínio
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Cloudinary
      },
    ],
  },
};

module.exports = nextConfig;
