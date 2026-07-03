import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SemAssinaturaContent } from "@/components/SemAssinaturaContent";

export const metadata: Metadata = {
  title: "Sem assinatura ativa — StamFlow",
  description:
    "Sua conta não tem uma assinatura ativa no momento. Escolha um plano para liberar o acesso completo ao StamFlow.",
  robots: { index: false, follow: false },
};

export default function SemAssinaturaPage() {
  return (
    <>
      <Header />
      <SemAssinaturaContent />
      <Footer />
    </>
  );
}
