/** @type {import('next').NextConfig} */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: join(__dirname, "../.."),
  turbopack: {
    root: join(__dirname, "../.."),
  },
};

export default nextConfig;
