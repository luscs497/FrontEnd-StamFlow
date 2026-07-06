import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TermosDeUsoContent } from "@/components/TermosDeUsoContent";

export const metadata: Metadata = {
  title: "Termos de Uso — StamFlow",
  description:
    "As regras para uso do StamFlow: conta, assinatura, cancelamento, uso aceitável e responsabilidades.",
};

export default function TermosDeUsoPage() {
  return (
    <>
      <Header />
      <TermosDeUsoContent />
      <Footer />
    </>
  );
}
