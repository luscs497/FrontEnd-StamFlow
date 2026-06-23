"use client";

import { motion } from "framer-motion";
import { Reveal, RevealGroup, SectionHeading } from "@/components/ui/Section";
import { fadeUp } from "@/lib/motion";

const STEPS = [
  {
    n: "01",
    title: "A câmera lê o seu corpo",
    body: "Ombros, cabeça, coluna e rotação do tronco — cada um com seu próprio status — além da sua expressão facial. Tudo a cada poucos segundos.",
    detail: ["Postura", "Rotação", "Expressão"],
  },
  {
    n: "02",
    title: "Vira um índice de energia",
    body: "Esses sinais se condensam num número só: a sua stamina do momento. Simples de ler, fácil de acompanhar ao longo do dia.",
    detail: ["Stamina ao vivo", "Tendência", "Histórico"],
  },
  {
    n: "03",
    title: "Você recebe o cuidado certo",
    body: "Quando a energia cai, o StamFlow sugere a pausa, a respiração, o exercício ou a trilha de foco que faz sentido para aquele instante.",
    detail: ["Pausa", "Respiração", "Foco"],
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
                Da câmera ao cuidado, <span className="text-raio">em três passos</span>.
              </>
            }
            description="Um fluxo contínuo que roda em silêncio enquanto você trabalha. Nada para configurar, nada para pensar."
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
              <h3 className="mt-6 font-display text-2xl font-bold text-cloud">{step.title}</h3>
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
