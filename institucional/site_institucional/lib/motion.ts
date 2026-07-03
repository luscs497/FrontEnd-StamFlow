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
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.03 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

// Configuração padrão de viewport para reveals. amount menor = dispara assim
// que a seção começa a entrar na tela (antes exigia 30% visível, o que dava
// sensação de "demora pra surgir"); a margem negativa foi reduzida no mesmo
// sentido para o efeito começar mais cedo no scroll.
export const viewportOnce = { once: true, amount: 0.12, margin: "0px 0px -5% 0px" } as const;
