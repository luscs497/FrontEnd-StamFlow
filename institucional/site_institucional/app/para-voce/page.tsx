import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ParaVoceContent } from "@/components/para-voce/ParaVoceContent";

export const metadata: Metadata = {
  title: "StamFlow para Você — Sua energia produtiva, lida pela câmera",
  description:
    "Acompanhe seu humor, sua postura e sua energia em tempo real enquanto trabalha. Exercícios, foco e pausas na hora certa — com tudo processado no seu navegador. Comece grátis por 7 dias.",
  alternates: { canonical: "/para-voce" },
  openGraph: {
    title: "StamFlow para Você — Cuide da sua energia enquanto trabalha",
    description:
      "Leitura de humor, postura e energia em tempo real, 100% no seu dispositivo. Exercícios, foco e pausas guiadas. Teste grátis por 7 dias, sem cartão.",
    url: "https://stamflow.com.br/para-voce",
  },
};

export default function ParaVocePage() {
  return (
    <>
      <Header />
      <ParaVoceContent />
      <Footer />
    </>
  );
}
