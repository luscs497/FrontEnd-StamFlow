import type { Metadata, Viewport } from "next";
import "./globals.css";

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
        {/* Swiper styles (used by the onboarding carousel) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
        {/* CORREÇÃO DEMO: estilo do overlay de paywall (decisão de produto, 2026-06) */}
        <link rel="stylesheet" href="/styles/demo-paywall.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
