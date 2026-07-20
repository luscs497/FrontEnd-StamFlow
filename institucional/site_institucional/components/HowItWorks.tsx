"use client";

import { motion } from "framer-motion";
import { Reveal, RevealGroup, SectionHeading } from "@/components/ui/Section";
import { fadeUp } from "@/lib/motion";

const STEPS = [
  {
    n: "01",
    title: "Protege",
    body: "O Checkup Scan analisa em tempo real, via webcam, sua ergonomia e biomecânica — com processamento local, 100% de privacidade e segurança.",
    detail: ["Checkup Scan", "Ergonomia", "Tempo real"],
  },
  {
    n: "02",
    title: "Engaja",
    body: "A Barra de Stamina gamefica seu bem-estar e energia produtiva, de forma simples. O sistema entende, em segundos, quando você precisa de uma recarga.",
    detail: ["Barra de Stamina", "Energia", "Bem-estar"],
  },
  {
    n: "03",
    title: "Intervém",
    body: "Antes da dor ou da fadiga surgirem, o StamFlow sugere breves pausas estratégicas que recarregam sua energia física e emocional.",
    detail: ["Pausas", "Recarga", "Prevenção"],
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-28 sm:py-36">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Como funciona"
            title={
              <>
                O seu <span className="text-raio">guardião de performance</span> em tempo real.
              </>
            }
            description="O StamFlow é um sistema inovador de monitoramento preventivo — uma inteligência ativa de biofeedback que cuida de você enquanto você trabalha."
          />
        </Reveal>

        <RevealGroup className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <motion.div
              key={step.n}
              variants={fadeUp}
              className="surface-card group relative p-8 transition-colors duration-300 hover:border-white/20"
            >
              <span className="font-display text-6xl font-bold text-raio/90">{step.n}</span>
              {/* Guia visual B2C: passos com o ícone de tick verde (✅ do doc de copy). */}
              <h3 className="mt-6 flex items-center gap-2.5 font-display text-2xl font-bold text-cloud">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-signal/15 text-signal">
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6.2l2.2 2.2L9.5 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {step.title}
              </h3>
              <p className="mt-3.5 text-base leading-relaxed text-slatey">{step.body}</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {step.detail.map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-hairline bg-surface-2/40 px-3.5 py-1.5 text-[13px] font-medium text-slatey"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
