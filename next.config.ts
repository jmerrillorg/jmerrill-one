import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // REQUIRED for Azure App Service
};

export default nextConfig;