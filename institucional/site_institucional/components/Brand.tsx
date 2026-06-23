"use client";

import { useId } from "react";

/**
 * A chama da marca (recriada em vetor a partir da logo enviada):
 * corpo frio ciano → azul → violeta, com a pontinha quente lá no topo.
 */
export function Flame({ size = 26 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id={`flame-${id}`} x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="24%" stopColor="#7c3aed" />
          <stop offset="58%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z"
        fill={`url(#flame-${id})`}
      />
    </svg>
  );
}

/** Mark autônomo: a chama dentro de um tile arredondado (uso em destaque). */
export function BrandMark({ size = 36, radius = 12 }: { size?: number; radius?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center border border-hairline bg-surface-2/60"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Flame size={size * 0.62} />
    </span>
  );
}

/** Logo completa: wordmark "Stam" + chama + "Flow", como na marca enviada. */
export function Logo({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center font-display font-bold tracking-tight text-cloud"
      style={{ fontSize: size, lineHeight: 1 }}
    >
      Stam
      <Flame size={size * 1.15} />
      <span className="-ml-[0.06em]">Flow</span>
    </span>
  );
}
