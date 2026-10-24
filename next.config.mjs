/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simpleicons.org" },
    ],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
