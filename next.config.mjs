/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // tambahkan origin IP / domain yang diizinkan
    allowedDevOrigins: [
      "http://192.168.56.1:3000", // sesuaikan dengan IP dev kamu
      "http://localhost:3000", // default dev origin
    ],
  },
};

export default nextConfig;
