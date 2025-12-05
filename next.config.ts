import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: '10mb', // Aumenta para 10MB
  },
  // ... outras configs existentes
};

export default nextConfig;
