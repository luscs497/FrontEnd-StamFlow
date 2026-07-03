"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";

/**
 * Casca de modal acessível: role="dialog", fecha no Esc e no backdrop,
 * trava o scroll, foca o primeiro campo ao abrir e devolve o foco ao fechar.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Mantém sempre a versão mais recente de onClose sem que ela vire
  // dependência dos effects abaixo. Sem isso, como o componente pai recria
  // a função onClose a cada render (ex.: a cada tecla digitada num input),
  // o effect de foco re-executava e roubava o foco do input, jogando-o no
  // primeiro elemento focável (o botão X). Esse era o bug de "perde o foco
  // a cada letra".
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Effect 1 — trava o scroll e foca o primeiro campo. Depende SÓ de `open`,
  // então só roda ao abrir/fechar o modal, nunca a cada tecla.
  useEffect(() => {
    if (!open) return;

    lastFocused.current = document.activeElement as HTMLElement;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const t = window.setTimeout(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'input, button, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }, 30);

    return () => {
      window.clearTimeout(t);
      root.style.overflow = prevOverflow;
      lastFocused.current?.focus?.();
    };
  }, [open]);

  // Effect 2 — teclas (Esc para fechar, Tab para o trap de foco). Também
  // depende só de `open`; usa onCloseRef para sempre chamar a versão atual
  // do onClose sem virar dependência.
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      // Trap de foco simples dentro do painel.
      if (e.key === "Tab" && panelRef.current) {
        const nodes = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'input, button, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
          )
        ).filter((n) => !n.hasAttribute("disabled"));
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className="surface-card relative w-full max-w-md overflow-hidden bg-surface p-6 shadow-lift sm:p-7"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Filete de marca no topo do painel */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-raio" aria-hidden="true" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Botão de fechar reutilizável (canto superior direito). */
export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Fechar"
      className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-hairline text-slatey transition-colors hover:border-white/25 hover:text-cloud"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </button>
  );
}
