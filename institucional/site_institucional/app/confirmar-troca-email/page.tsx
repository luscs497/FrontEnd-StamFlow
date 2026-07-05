import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConfirmarTrocaEmailContent } from "@/components/ConfirmarTrocaEmailContent";

export const metadata: Metadata = {
  title: "Confirmar troca de e-mail — StamFlow",
  robots: { index: false, follow: false },
};

export default function ConfirmarTrocaEmailPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <ConfirmarTrocaEmailContent />
      </Suspense>
      <Footer />
    </>
  );
}
