import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  
  // Aumentar limite de Server Actions para 10MB
  serverActions: {
    bodySizeLimit: '10mb',
  },
};

export default nextConfig;
