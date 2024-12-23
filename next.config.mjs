import withPWA from "next-pwa"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Next.jsの設定はここに置く
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  ...withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
  }),
}

export default nextConfig
