import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the local Soroban contract bindings package (ESM)
  transpilePackages: ["livehub_contract"],
  // Empty turbopack config to silence the webpack warning,
  // and to ensure Turbopack (default in Next.js 16) works correctly.
  turbopack: {},
};

export default nextConfig;
