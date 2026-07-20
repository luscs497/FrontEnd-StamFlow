"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

/**
 * Hero assimétrica ("espectro de energia"): texto à esquerda e, à direita,
 * o EnergyMeter — um recorte do produto real (aba Checkup Scan) com a leitura
 * de energia ao vivo. A assinatura visual é o espectro verde→âmbar→vermelho
 * do próprio sistema, no lugar do degradê centralizado genérico.
 */
export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden">
      {/* Linha de horizonte no espectro de energia — única marca de cor do fundo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(52,211,153,0.45), rgba(251,191,36,0.4), rgba(248,113,113,0.35), transparent)",
        }}
      />

      <div className="mx-auto grid max-w-[88rem] items-center gap-14 px-6 pb-20 pt-32 sm:px-10 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:pb-28">
        {/* Coluna de texto */}
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.p variants={fadeUp} className="eyebrow">
            <span className="eyebrow-tick" /> Eleve seu foco e produtividade
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-6 max-w-xl text-balance font-display font-bold text-huge text-cloud"
          >
            Cansado de passar o dia com{" "}
            <span className="text-[#fb8a8a]">dor nas costas</span> e frustrado
            com seu rendimento?
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-lg leading-relaxed text-slatey sm:text-xl"
          >
            Tenha um parceiro leal de produtividade, que te acompanha durante toda sua jornada,
            prevenindo a exaustão antes que ela aconteça e{" "}
            <span className="text-cloud">protegendo seu foco nas tarefas</span>.
          </motion.p>

          <motion.p variants={fadeUp} className="mt-8 text-sm text-muted">
            Processado 100% no seu navegador · cancele quando quiser
          </motion.p>
        </motion.div>

        {/* Coluna do produto */}
        <EnergyMeter />
      </div>
    </section>
  );
}

/* ─────────────────────  ENERGY METER (recorte do produto)  ───────────────── */

const SPECTRUM =
  "linear-gradient(90deg, #f87171 0%, #fb923c 26%, #fbbf24 52%, #34d399 100%)";

const BODY_ROWS = [
  { label: "Ombros", status: "Perfeito", color: "#34d399" },
  { label: "Cabeça", status: "Bom", color: "#34d399" },
  { label: "Coluna lombar", status: "Atenção", color: "#fbbf24" },
] as const;

function EnergyMeter() {
  const reduce = useReducedMotion();
  const value = 84;

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div className="surface-card p-7 sm:p-8">
        {/* Cabeçalho do painel: a aba do sistema + leitura ao vivo */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-slatey">
            Checkup Scan
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-2/60 px-3 py-1.5 text-[12px] font-medium text-slatey">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-signal" />
            Ao vivo
          </span>
        </div>

        {/* Índice de energia */}
        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-display text-[64px] font-bold leading-none text-cloud tabular-nums">
            {value}
          </span>
          <span className="text-lg text-muted">/100</span>
        </div>
        <p className="mt-1.5 text-[15px] text-slatey">Sua energia agora</p>

        {/* Barra do espectro com o marcador da leitura */}
        <div className="relative mt-5">
          <div
            className="h-2.5 rounded-full opacity-90"
            style={{ background: SPECTRUM }}
          />
          <motion.span
            initial={{ left: "6%" }}
            animate={{ left: `${value}%` }}
            transition={{ duration: reduce ? 0 : 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 h-[18px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cloud shadow-[0_0_0_3px_rgba(11,17,32,0.9)]"
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] uppercase tracking-wider text-muted">
          <span>Crítico</span>
          <span>Perfeito</span>
        </div>

        {/* Status por parte do corpo, como no produto */}
        <ul className="mt-6 divide-y divide-hairline border-t border-hairline">
          {BODY_ROWS.map((row, i) => (
            <motion.li
              key={row.label}
              initial={{ opacity: 0, x: reduce ? 0 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.55 + i * 0.12 }}
              className="flex items-center justify-between py-3.5"
            >
              <span className="text-[15px] text-slatey">{row.label}</span>
              <span className="inline-flex items-center gap-2 text-[14px] font-medium text-cloud">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                {row.status}
              </span>
            </motion.li>
          ))}
        </ul>

        <p className="mt-5 text-[12.5px] text-muted">
          Leitura feita pela câmera, 100% no seu navegador.
        </p>
      </div>

      {/* Chip de intervenção: o produto agindo antes da dor */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.15 }}
        className="absolute -bottom-5 left-5 right-5 sm:left-auto sm:right-8 sm:w-max"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-ink/95 px-4 py-3 shadow-lift backdrop-blur-md">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-signal/15 text-signal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13.5 2L4 13.2h6.2L9.5 22 20 10.4h-6.7L13.5 2Z" fill="currentColor" />
            </svg>
          </span>
          <div className="text-[13px] leading-tight">
            <p className="font-semibold text-cloud">Boost sugerido</p>
            <p className="mt-0.5 text-slatey">Pausa Mental · 2 min</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
