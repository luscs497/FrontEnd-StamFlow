import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "StamFlow — Sua energia produtiva, lida pela câmera",
  description:
    "O StamFlow lê postura e humor em tempo real, 100% no seu navegador, e transforma isso num índice de energia que cuida de você ao longo do dia. Teste grátis por 7 dias.",
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
    <html lang="pt-BR">
      <head>
        {/* Fontes: Space Grotesk (display, geométrica e premium) + Inter (UI).
            Carregadas via link para não depender de fetch em build (export estático). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Mapeia as fontes para as variáveis usadas no Tailwind */}
        <style>{`:root{--font-display:'Space Grotesk';--font-inter:'Inter';}`}</style>
      </head>
      <body>
        <div className="bg-atmosphere" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
