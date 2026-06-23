"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

/**
 * ELEMENTO-ASSINATURA do site.
 *
 * O StamFlow destila postura + humor num índice de energia que sobe e desce ao
 * longo do dia. Em vez de um print do app ou de um "blob" de gradiente genérico,
 * a hero mostra esse índice como um SINAL VIVO: uma curva de stamina desenhada
 * com o gradiente da marca, com pontos de pausa e um marcador "agora" pulsando.
 *
 * A mesma curva volta, menor e mais quieta, como divisor entre seções.
 */

// Curva de stamina (uma manhã sobe, cai depois do almoço, recupera com a pausa).
const PATH =
  "M0,150 C60,140 90,90 140,82 C190,74 210,120 260,118 C300,116 320,150 360,168 C400,186 430,150 470,120 C520,84 560,96 600,70";

// Pontos notáveis sobre a curva (x, y, rótulo).
const MARKERS = [
  { x: 140, y: 82, label: "pico de foco", tone: "signal" as const },
  { x: 360, y: 168, label: "pausa sugerida", tone: "amber" as const },
];

const NOW = { x: 600, y: 70 };

export function EnergyWave({
  variant = "hero",
  className = "",
}: {
  variant?: "hero" | "divider";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const gid = useId().replace(/:/g, "");

  const isHero = variant === "hero";

  return (
    <svg
      viewBox="0 0 600 220"
      className={className}
      role="img"
      aria-label="Curva de energia ao longo do dia, com pico de foco e pausa sugerida"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`stroke-${gid}`} x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="42%" stopColor="#3b82f6" />
          <stop offset="72%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="220">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grade discreta só na variante hero */}
      {isHero && (
        <g stroke="rgba(148,163,184,0.10)" strokeWidth="1">
          {[44, 110, 176].map((y) => (
            <line key={y} x1="0" y1={y} x2="600" y2={y} />
          ))}
        </g>
      )}

      {/* Área sob a curva */}
      <motion.path
        d={`${PATH} L600,220 L0,220 Z`}
        fill={`url(#fill-${gid})`}
        initial={reduce ? { opacity: 0.6 } : { opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1, delay: 0.4 }}
      />

      {/* A curva em si, desenhando-se na entrada */}
      <motion.path
        d={PATH}
        fill="none"
        stroke={`url(#stroke-${gid})`}
        strokeWidth={isHero ? 3 : 2}
        strokeLinecap="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {isHero && (
        <>
          {/* Marcadores de momentos do dia */}
          {MARKERS.map((m, i) => (
            <motion.g
              key={m.label}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.25, duration: 0.5 }}
            >
              <circle cx={m.x} cy={m.y} r="5" fill="#0b1120" stroke={m.tone === "signal" ? "#34d399" : "#f59e0b"} strokeWidth="2.5" />
              <line x1={m.x} y1={m.y} x2={m.x} y2={m.y - 26} stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
              <text
                x={m.x}
                y={m.y - 32}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={m.tone === "signal" ? "#34d399" : "#f59e0b"}
                style={{ letterSpacing: "0.02em" }}
              >
                {m.label}
              </text>
            </motion.g>
          ))}

          {/* Marcador "agora", pulsando */}
          <motion.g
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.4 }}
          >
            <circle cx={NOW.x} cy={NOW.y} r="11" fill="#38bdf8" opacity="0.18" className={reduce ? "" : "animate-pulse-dot"} />
            <circle cx={NOW.x} cy={NOW.y} r="5" fill="#38bdf8" />
          </motion.g>
        </>
      )}
    </svg>
  );
}
