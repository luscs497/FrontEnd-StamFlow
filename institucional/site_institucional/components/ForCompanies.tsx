"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Section";
import { useModals } from "@/components/Providers";
import { viewportOnce } from "@/lib/motion";

export function ForCompanies() {
  const { openEnterprise } = useModals();

  return (
    <section id="empresas" className="py-28 sm:py-36">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow">
              <span className="eyebrow-tick" /> Para empresas
            </p>
            <h2 className="mt-5 font-display font-bold text-huge text-cloud">
              O bem-estar da equipe, <span className="text-raio">sem invadir ninguém</span>.
            </h2>
            <p className="mt-5 text-xl leading-relaxed text-slatey">
              O gestor enxerga a energia da equipe de forma agregada — tendências, picos e quedas do time como um
              todo. Nunca a leitura individual e sensível de cada pessoa. Cuidado coletivo, privacidade preservada.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {[
                { k: "Visão agregada", v: "Energia do time, não da pessoa" },
                { k: "Por licenças", v: "Colaboradores e gestores" },
                { k: "Dado sensível", v: "Fica sempre individual e local" },
              ].map((c) => (
                <div key={c.k} className="rounded-field border border-hairline bg-surface/50 p-5">
                  <p className="text-[13px] font-semibold uppercase tracking-wide text-brand-cyan">{c.k}</p>
                  <p className="mt-2 text-[15px] text-slatey">{c.v}</p>
                </div>
              ))}
            </div>

            <button type="button" onClick={openEnterprise} className="btn-primary mt-9 px-7 py-4 text-base">
              Falar sobre a minha equipe
            </button>
          </Reveal>

          {/* Painel agregado ilustrativo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] text-muted">Energia média da equipe</p>
                <p className="mt-1.5 font-display text-[44px] font-bold text-cloud tabular-nums">
                  68<span className="text-2xl text-muted">/100</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/15 px-3.5 py-2 text-[15px] font-semibold text-signal">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 9l3.5-3.5L8 8l4-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                +6 na semana
              </span>
            </div>

            <div className="mt-8 space-y-5">
              {[
                { label: "Manhã", value: 78 },
                { label: "Início da tarde", value: 54 },
                { label: "Fim do dia", value: 63 },
              ].map((row, i) => (
                <div key={row.label}>
                  <div className="mb-2 flex items-center justify-between text-[15px]">
                    <span className="text-slatey">{row.label}</span>
                    <span className="text-cloud tabular-nums">{row.value}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                    <motion.div
                      className="h-full rounded-full bg-raio"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.value}%` }}
                      viewport={viewportOnce}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 rounded-field border border-hairline bg-surface-2/40 px-5 py-3.5 text-sm text-muted">
              Dados sempre agregados. O gestor nunca vê a leitura individual de um colaborador.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
