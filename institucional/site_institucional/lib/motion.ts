import type { Variants } from "framer-motion";

/**
 * Variantes de movimento compartilhadas. Movimento discreto e orquestrado —
 * reveals no scroll e stagger de entrada. O respeito a prefers-reduced-motion
 * é tratado via CSS global e via useReducedMotion nos componentes sensíveis.
 */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// Configuração padrão de viewport para reveals (dispara uma vez, com margem).
export const viewportOnce = { once: true, amount: 0.3, margin: "0px 0px -10% 0px" } as const;
