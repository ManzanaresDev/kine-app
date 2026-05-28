// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Required for @react-pdf/renderer in Next.js App Router
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

module.exports = nextConfig;
