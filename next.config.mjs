/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three / r3f ship ESM; transpile for older bundling targets
  transpilePackages: ["three"],
};

export default nextConfig;
