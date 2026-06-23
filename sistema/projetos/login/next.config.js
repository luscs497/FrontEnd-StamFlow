/** @type {import('next').NextConfig} */
// Headers de segurança configurados via .htaccess na raiz do /out.

const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  output: "export",
};

module.exports = nextConfig;