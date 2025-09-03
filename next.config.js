/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "protapcars.vercel.app",
      },
    ],
  },
};

module.exports = nextConfig;
