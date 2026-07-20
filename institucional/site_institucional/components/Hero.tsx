"use client";

import { motion } from "framer-motion";
import { Raio } from "@/components/Brand";
import { WaveField } from "@/components/WaveField";
import { fadeUp, stagger } from "@/lib/motion";

/**
 * Hero "ondas de energia": canvas com linhas luminosas contínuas que reagem
 * ao mouse (WaveField). Conteúdo centralizado, sem botões, conforme o doc de
 * copy da LP B2C.
 */

const PILLS = [
  "Processado 100% no seu navegador",
  "Leitura pela câmera, ao vivo",
  "Cancele quando quiser",
] as const;

export function Hero() {
  return (
    <section id="topo" className="relative flex min-h-[76vh] items-center overflow-hidden">
      <WaveField />

      {/* Véu sutil atrás do bloco de texto, para leitura sobre as ondas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
        style={{
          background:
            "radial-gradient(52% 60% at 50% 38%, rgba(11,17,32,0.72), transparent 75%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24 pt-32 text-center sm:px-8 sm:pt-36">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.p
            variants={fadeUp}
            className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-slatey backdrop-blur-sm"
          >
            <Raio size={14} /> Eleve seu foco e produtividade
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mx-auto mt-7 max-w-3xl text-balance font-display font-bold text-huge text-cloud"
          >
            Cansado de passar o dia com{" "}
            <span className="text-raio">dor nas costas</span> e frustrado com seu
            rendimento?
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slatey sm:text-lg"
          >
            Tenha um parceiro leal de produtividade, que te acompanha durante toda sua jornada,
            prevenindo a exaustão antes que ela aconteça e{" "}
            <span className="text-cloud">protegendo seu foco nas tarefas</span>.
          </motion.p>

          <motion.ul
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            {PILLS.map((pill) => (
              <li
                key={pill}
                className="rounded-full border border-hairline bg-surface/60 px-4 py-2 text-[13px] font-medium text-slatey backdrop-blur-sm"
              >
                {pill}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
