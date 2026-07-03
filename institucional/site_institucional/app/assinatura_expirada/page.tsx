import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AssinaturaExpiradaContent } from "@/components/AssinaturaExpiradaContent";

export const metadata: Metadata = {
  title: "Renove sua assinatura — StamFlow",
  description:
    "Que bom te ver de novo! Sua assinatura do StamFlow expirou. Renove para voltar a acessar o seu painel.",
  robots: { index: false, follow: false },
};

export default function AssinaturaExpiradaPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <AssinaturaExpiradaContent />
      </Suspense>
      <Footer />
    </>
  );
}
