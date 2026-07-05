"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/Brand";
import { useCart } from "@/components/Providers";
import { NAV, LOGIN_URL } from "@/lib/config";
import { formatBRL, priceFor } from "@/lib/plans";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trava o scroll quando o menu mobile está aberto.
  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-hairline bg-ink/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[88rem] items-center justify-between px-6 sm:px-10">
        <a href="/" className="rounded-lg" aria-label="StamFlow — início">
          <Logo size={23} />
        </a>

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Seções">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[15px] font-medium text-slatey transition-colors hover:text-cloud"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Carrinho: visível em todos os tamanhos */}
          <CartWidget />

          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={LOGIN_URL}
              className="text-[15px] font-semibold text-cloud transition-colors hover:text-brand-cyan"
            >
              Entrar
            </a>
            <a href="/#planos" className="btn-primary px-6 py-3 text-[15px]">
              Começar a Jornada
            </a>
          </div>

          {/* Botão do menu mobile */}
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-lg border border-hairline text-cloud lg:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Painel mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="lg:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-1.5 border-t border-hairline bg-ink/95 px-6 py-5 backdrop-blur-md">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 text-[17px] font-medium text-slatey transition-colors hover:bg-white/5 hover:text-cloud"
                >
                  {item.label}
                </a>
              ))}
              <div className="grid gap-3 pt-4">
                <a href={LOGIN_URL} className="btn-ghost w-full py-3.5 text-base">
                  Entrar
                </a>
                <a
                  href="/#planos"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  Começar a Jornada
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ────────────────────────  Carrinho no header  ─────────────────────
   Ícone com contador + dropdown (mini-carrinho) + pop-up "adicionado".
   O carrinho guarda no máximo 1 item (o plano no período escolhido).  */

function CartWidget() {
  const { item, period, clearCart, notice, dismissNotice } = useCart();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const count = item ? 1 : 0;
  const price = period ? priceFor(period) : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-11 w-11 place-items-center rounded-lg border border-hairline text-cloud transition-colors hover:bg-white/5"
        aria-label={count > 0 ? `Carrinho com ${count} item` : "Carrinho vazio"}
        aria-expanded={open}
      >
        {/* ícone de carrinho */}
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 4h2l2.4 12.2a1.5 1.5 0 001.47 1.2h8.9a1.5 1.5 0 001.46-1.16L21 9H6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="20.5" r="1.3" fill="currentColor" />
          <circle cx="17.5" cy="20.5" r="1.3" fill="currentColor" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-raio text-[11px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {/* Pop-up "adicionado ao carrinho" — aparece perto do ícone */}
      <AnimatePresence>
        {notice && (
          <motion.button
            type="button"
            onClick={() => {
              dismissNotice();
              setOpen(true);
            }}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 flex w-max max-w-[86vw] items-center gap-2.5 rounded-2xl border border-hairline bg-ink/95 px-4 py-3 text-left shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md sm:max-w-sm"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-signal/15 text-signal">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7.3l2.6 2.6L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[13.5px] leading-snug text-cloud">{notice}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dropdown do carrinho */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[19rem] max-w-[88vw] rounded-2xl border border-hairline bg-ink/95 p-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md"
          >
            {item && period && price ? (
              <>
                <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">Seu carrinho</p>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[15px] font-bold text-cloud">StamFlow Individual</p>
                    <p className="mt-0.5 text-[13.5px] text-slatey">
                      Período {period.label.toLowerCase()} · {formatBRL(price.perMonth)}/mês
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-[15px] font-bold text-cloud tabular-nums">
                    {formatBRL(price.total)}
                  </p>
                </div>
                <a href="/checkout/" className="btn-primary mt-4 w-full py-3 text-[15px]">
                  Concluir compra
                </a>
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setOpen(false);
                  }}
                  className="mt-2 w-full rounded-lg py-2 text-[13px] font-medium text-muted transition-colors hover:text-cloud"
                >
                  Remover do carrinho
                </button>
              </>
            ) : (
              <>
                <p className="text-[14.5px] text-slatey">Seu carrinho está vazio.</p>
                <a
                  href="/#planos"
                  onClick={() => setOpen(false)}
                  className="btn-ghost mt-4 w-full py-2.5 text-[14px]"
                >
                  Ver planos
                </a>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
