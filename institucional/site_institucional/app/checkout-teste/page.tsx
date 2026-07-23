import type { Metadata } from "next";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckoutTesteProvider } from "./CheckoutTesteProvider";

/**
 * Rota interna de teste do checkout transparente em PRODUÇÃO.
 *
 * Reusa o CheckoutContent do /checkout sem qualquer alteração, apenas
 * sobrescrevendo o carrinho com um plano fixo (id 7 — "Avulso Mensal Teste",
 * R$ 2,00/mês) via CheckoutTesteProvider. Não depende do carrinho real nem da
 * seleção de planos.
 *
 * Não indexável (robots noindex/nofollow) e não linkada em nenhum lugar; a
 * única forma de chegar aqui é digitando a URL.
 */
export const metadata: Metadata = {
  title: "Checkout de teste — StamFlow",
  description:
    "Rota interna de validação do checkout transparente com o plano de teste (R$ 2,00).",
  robots: { index: false, follow: false },
};

export default function CheckoutTestePage() {
  return (
    <>
      {/* SDK do Mercado Pago (Secure Fields) — idêntico ao /checkout real. */}
      <Script src="https://sdk.mercadopago.com/js/v2" strategy="afterInteractive" />
      <Header />
      <CheckoutTesteProvider />
      <Footer />
    </>
  );
}
