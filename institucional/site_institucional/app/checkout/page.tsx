import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckoutContent } from "@/components/CheckoutContent";

export const metadata: Metadata = {
  title: "Finalizar compra — StamFlow",
  description:
    "Revise seu plano, identifique-se e conclua a assinatura com pagamento seguro pelo Mercado Pago.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <CheckoutContent />
      <Footer />
    </>
  );
}
