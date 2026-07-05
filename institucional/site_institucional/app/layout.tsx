import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/Providers";
import "./globals.css";

// Fontes auto-hospedadas localmente (arquivos em app/fonts). Não dependem de
// rede externa nem no build nem no runtime — isso elimina o "flash" de fonte
// do sistema e as falhas de carregamento na primeira visita que aconteciam
// quando as fontes vinham do CDN do Google. display:"swap" evita texto
// invisível enquanto a fonte carrega.
const spaceGrotesk = localFont({
  src: [
    { path: "./fonts/space-grotesk-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/space-grotesk-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/space-grotesk-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "./fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StamFlow — Sua energia produtiva, lida pela câmera",
  description:
    "O StamFlow lê postura e humor em tempo real, 100% no seu navegador, e transforma isso num índice de energia que cuida de você ao longo do dia.",
  metadataBase: new URL("https://stamflow.com.br"),
  openGraph: {
    title: "StamFlow — Sua energia produtiva, lida pela câmera",
    description:
      "Postura e humor em tempo real, processados no navegador. Nenhuma imagem sai do seu computador.",
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "https://login.stamflow.com.br/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1120",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        {/* Marca <html class="js"> imediatamente (script síncrono no head, roda
            antes do paint). O CSS usa isso: se por qualquer motivo o JS não
            executar, os elementos que o framer-motion renderizou com opacity:0
            no HTML estático são revelados via CSS — evitando a tela "só com o
            header" que exigia F5. Com JS ativo, o framer controla normalmente. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />
      </head>
      <body>
        <div className="bg-atmosphere" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
