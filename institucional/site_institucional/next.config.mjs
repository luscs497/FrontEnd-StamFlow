/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático: gera um site 100% HTML/JS/CSS, sem servidor Node em produção.
  // É isso que permite o deploy em hospedagem estática (Hostinger).
  output: "export",

  // Sem otimizador de imagem de servidor (não existe servidor no export estático).
  images: {
    unoptimized: true,
  },

  // Mantém o type-check do TypeScript, mas não deixa avisos de lint travarem o build.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Trailing slash facilita o roteamento em hospedagem estática simples.
  trailingSlash: true,
};

export default nextConfig;
