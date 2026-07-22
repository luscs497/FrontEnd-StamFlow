import type { Metadata } from "next";
import Script from "next/script";
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
      {/* SDK do Mercado Pago (Secure Fields). `beforeInteractive` só vale no root
          layout no App Router; aqui o CheckoutContent aguarda window.MercadoPago. */}
      <Script src="https://sdk.mercadopago.com/js/v2" strategy="afterInteractive" />
      <Header />
      <CheckoutContent />
      <Footer />
    </>
  );
}
