import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmpresasContent } from "@/components/empresas/EmpresasContent";

export const metadata: Metadata = {
  title: "StamFlow para Empresas — Bem-estar da equipe e apoio à NR-1",
  description:
    "Cada colaborador com seu painel de bem-estar; o gestor acompanha a energia da equipe de forma agregada. Um instrumento de apoio ao monitoramento contínuo exigido pela nova NR-1. Agende uma demonstração ao vivo.",
  alternates: { canonical: "/empresas" },
  openGraph: {
    title: "StamFlow para Empresas — Você, conectado com a sua empresa",
    description:
      "Painéis individuais, visão agregada para o gestor e apoio ao monitoramento contínuo da NR-1. Fale com o nosso time e agende uma demonstração ao vivo.",
    url: "https://stamflow.com.br/empresas",
  },
};

export default function EmpresasPage() {
  return (
    <>
      <Header />
      <EmpresasContent />
      <Footer />
    </>
  );
}
