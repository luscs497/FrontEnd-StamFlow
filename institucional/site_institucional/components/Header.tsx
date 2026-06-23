"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/Brand";
import { useModals } from "@/components/Providers";
import { NAV, LOGIN_URL } from "@/lib/config";

export function Header() {
  const { openTrial } = useModals();
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
        <a href="#topo" className="rounded-lg" aria-label="StamFlow — início">
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

        <div className="hidden items-center gap-4 lg:flex">
          <a href={LOGIN_URL} className="text-[15px] font-semibold text-cloud transition-colors hover:text-brand-cyan">
            Entrar
          </a>
          <button type="button" onClick={openTrial} className="btn-primary px-6 py-3 text-[15px]">
            Começar teste grátis
          </button>
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
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openTrial();
                  }}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  Começar teste grátis
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
