import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VerificarEmailContent } from "@/components/VerificarEmailContent";

export const metadata: Metadata = {
  title: "Verificar e-mail — StamFlow",
  robots: { index: false, follow: false },
};

export default function VerificarEmailPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <VerificarEmailContent />
      </Suspense>
      <Footer />
    </>
  );
}
