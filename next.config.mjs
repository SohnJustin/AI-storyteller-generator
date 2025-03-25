/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/about",
        destination: "/pages",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
