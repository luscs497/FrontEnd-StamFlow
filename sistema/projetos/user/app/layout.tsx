import fs from "node:fs";
import path from "node:path";
import type { Metadata, Viewport } from "next";
import "./globals.css";
// Aba Detox Mental: utilitárias geradas pelo Tailwind, já escopadas em
// #detox-root. Fica em arquivo separado por ser gerado — ver o cabeçalho dele.
import "./detox.css";

// Lido em build time (Server Component), no mesmo padrao do LegacyMarkup.
const SWIPER_CSS = fs.readFileSync(
  path.join(process.cwd(), "app", "_legacy", "swiper-bundle.min.css"),
  "utf8"
);

export const metadata: Metadata = {
  title: "StamFlow",
  description:
    "Power Dash AI - Monitor your productivity with stamina tracking, posture checks, guided exercises, and mental breaks. Optimize your well-being and focus.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Inter — identical Google Fonts loading to the original page */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        {/*
          Q3 — Swiper styles (used by the onboarding carousel), embutidos.

          Como <link> para o jsDelivr, este arquivo era uma requisicao
          cross-origin BLOQUEANTE de render: DNS + TLS + download antes de
          qualquer pixel, e o onboarding e justamente a primeira tela. Embutido
          ele custa ~18 KB no HTML, que o Brotli (Q1) reduz a poucos KB — e o
          HTML ja estava sendo baixado de qualquer forma.

          Byte a byte o mesmo CSS do CDN (swiper@11), mantido nesta MESMA
          posicao do <head> para preservar a ordem da cascata: continua depois
          dos estilos do Next, como era.
        */}
        <style dangerouslySetInnerHTML={{ __html: SWIPER_CSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
