/** @type {import('next').NextConfig} */
// Headers de segurança configurados via .htaccess na raiz do /out.

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
};

export default nextConfig;