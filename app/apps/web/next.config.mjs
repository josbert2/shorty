/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@remotion/bundler",
    "@remotion/renderer",
    "@remotion/compositor-linux-x64-gnu",
    "@remotion/compositor-linux-x64-musl",
    "@remotion/compositor-darwin-arm64",
    "@remotion/compositor-darwin-x64",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.shots.so" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "pub-5ad14bf9b5e143b0af5153b86b9e4cea.r2.dev" },
    ],
  },
};

export default nextConfig;
