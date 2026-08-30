/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "framer-motion",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://127.0.0.1:8000/uploads/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
