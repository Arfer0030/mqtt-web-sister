/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      "http://192.168.56.1:3000", 
      "http://localhost:3000", 
    ],
  },
};

export default nextConfig;
