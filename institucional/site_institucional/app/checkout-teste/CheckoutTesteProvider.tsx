"use client";

import { CartContext, type CartItem } from "@/components/Providers";
import { CheckoutContent } from "@/components/CheckoutContent";
import type { Period } from "@/lib/plans";

/**
 * Sobrescreve o CartContext apenas nesta rota, fixando o plano de teste do
 * backend (id 7 — "Avulso Mensal Teste", price_in_cents 200, mensal). O
 * CheckoutContent lê `period.backendPlanId` no POST /subscription/checkout/subscribe
 * e deriva o preço de `priceFor(period)` a partir de `priceInCents`, então este
 * Period sintético é suficiente para exercitar o fluxo real com R$ 2,00.
 */
const TEST_ITEM: CartItem = { periodId: "mensal", addedAt: Date.now() };

const TEST_PERIOD: Period = {
  id: "mensal",
  label: "Mensal",
  months: 1,
  priceInCents: 200, // R$ 2,00
  backendPlanId: 7, // plano "Avulso Mensal Teste"
};

export function CheckoutTesteProvider() {
  const value = {
    item: TEST_ITEM,
    period: TEST_PERIOD,
    addToCart: () => {},
    // no-op de propósito: o fluxo de sucesso do CheckoutContent chama clearCart()
    // antes de redirecionar, e não queremos apagar o carrinho real do usuário.
    clearCart: () => {},
    notice: null,
    dismissNotice: () => {},
  };

  return (
    <CartContext.Provider value={value}>
      <CheckoutContent />
    </CartContext.Provider>
  );
}
