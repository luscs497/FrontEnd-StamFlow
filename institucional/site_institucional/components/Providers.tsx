"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { EnterpriseModal } from "@/components/EnterpriseModal";
import { PERIODS, type Period, type PeriodId } from "@/lib/plans";

/* ────────────────────────────  Modais  ──────────────────────────── */

interface ModalApi {
  openEnterprise: () => void;
}

const ModalContext = createContext<ModalApi | null>(null);

export function useModals(): ModalApi {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals deve ser usado dentro de <Providers>");
  return ctx;
}

/* ────────────────────────────  Carrinho  ────────────────────────── */

/**
 * Carrinho do site: guarda NO MÁXIMO um item (o plano individual no período
 * escolhido — adicionar outro período substitui o atual). Persistido em
 * localStorage para sobreviver a recarregamentos e navegação.
 */
export interface CartItem {
  periodId: PeriodId;
  addedAt: number;
}

interface CartApi {
  /** Item atual do carrinho (ou null). */
  item: CartItem | null;
  /** Período correspondente ao item (resolvido de PERIODS), ou null. */
  period: Period | null;
  /** Adiciona (ou substitui) o plano do período informado. */
  addToCart: (periodId: PeriodId) => void;
  /** Esvazia o carrinho. */
  clearCart: () => void;
  /** Texto do aviso "adicionado ao carrinho" (null = sem aviso visível). */
  notice: string | null;
  /** Fecha o aviso manualmente. */
  dismissNotice: () => void;
}

// Exportado para permitir um provider aninhado que sobrescreve o carrinho em
// rotas específicas (ex.: /checkout-teste injeta um plano fixo). O provider raiz
// em layout.tsx segue sendo a fonte do carrinho real em todo o resto do site.
export const CartContext = createContext<CartApi | null>(null);

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <Providers>");
  return ctx;
}

const CART_STORAGE_KEY = "stamflow_cart_v1";

function readCartFromStorage(): CartItem | null {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CartItem;
    // Valida que o período ainda existe (proteção contra dados antigos).
    if (parsed && PERIODS.some((p) => p.id === parsed.periodId)) return parsed;
  } catch {
    // storage indisponível ou corrompido: segue sem carrinho
  }
  return null;
}

/* ────────────────────────────  Providers  ───────────────────────── */

export function Providers({ children }: { children: ReactNode }) {
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);

  const openEnterprise = useCallback(() => setEnterpriseOpen(true), []);

  // ---- carrinho ----
  const [item, setItem] = useState<CartItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);

  // Carrega do localStorage só no cliente (evita mismatch de hidratação).
  useEffect(() => {
    setItem(readCartFromStorage());
  }, []);

  const addToCart = useCallback((periodId: PeriodId) => {
    const period = PERIODS.find((p) => p.id === periodId);
    if (!period) return;
    const next: CartItem = { periodId, addedAt: Date.now() };
    setItem(next);
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // sem storage (modo privado etc.): o carrinho vive só na sessão
    }
    // Aviso perto do ícone do carrinho, some sozinho.
    setNotice(`Adicionado ao carrinho: StamFlow Individual — ${period.label}`);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 4000);
  }, []);

  const clearCart = useCallback(() => {
    setItem(null);
    try {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const dismissNotice = useCallback(() => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    setNotice(null);
  }, []);

  const period = item ? PERIODS.find((p) => p.id === item.periodId) ?? null : null;

  return (
    <ModalContext.Provider value={{ openEnterprise }}>
      <CartContext.Provider
        value={{ item, period, addToCart, clearCart, notice, dismissNotice }}
      >
        {children}
        <EnterpriseModal open={enterpriseOpen} onClose={() => setEnterpriseOpen(false)} />
      </CartContext.Provider>
    </ModalContext.Provider>
  );
}
