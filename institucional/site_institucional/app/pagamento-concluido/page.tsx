import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PagamentoConcluido } from "@/components/PagamentoConcluido";

export const metadata: Metadata = {
  title: "Pagamento — StamFlow",
  robots: { index: false, follow: false },
};

export default function PagamentoConcluidoPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <PagamentoConcluido />
      </Suspense>
      <Footer />
    </>
  );
}
