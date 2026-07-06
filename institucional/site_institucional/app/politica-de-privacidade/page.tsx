import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PoliticaPrivacidadeContent } from "@/components/PoliticaPrivacidadeContent";

export const metadata: Metadata = {
  title: "Política de Privacidade — StamFlow",
  description:
    "Como o StamFlow trata seus dados. O processamento de imagem acontece 100% no seu navegador — nenhum vídeo ou foto é enviado aos nossos servidores.",
};

export default function PoliticaPrivacidadePage() {
  return (
    <>
      <Header />
      <PoliticaPrivacidadeContent />
      <Footer />
    </>
  );
}
