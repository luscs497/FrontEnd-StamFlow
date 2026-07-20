"use client";

import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/ui/Section";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const PROBLEMS = [
  {
    title: "Postura inadequada",
    body: "Você não percebe até sentir dor. E seu corpo acumula tensões que prejudicam ainda mais a produtividade.",
  },
  {
    title: "Sobrecarga mental",
    body: "Você está logado, mas operando com \u201cbateria baixa\u201d, perdendo foco e agilidade, se distraindo entre telas.",
  },
  {
    title: "Dopamina rápida",
    body: "Em busca de alegria instantânea, você acaba sendo alvo fácil de redes sociais, streamings e jogos.",
  },
  {
    title: "Estresse crônico",
    body: "O peso do cansaço físico e da autocobrança emocional pode ultrapassar o limite tolerável e travar de vez.",
  },
];

export function Burnout() {
  return (
    <section id="procrastinacao" className="py-28 sm:py-36">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Procrastinação e esgotamento"
            title={
              <>
                Por que a sua rotina atual está <span className="text-raio">drenando a sua bateria</span>?
              </>
            }
            description="Você não está procrastinando por preguiça. Você está rodando “loops neurológicos” automáticos para aliviar o micro-desconforto causado por horas de cansaço físico, sobrecarga mental e estresse crônico."
          />
        </Reveal>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-5 sm:grid-cols-2"
        >
          {PROBLEMS.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              className="surface-card flex items-start gap-4 p-7"
            >
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgba(239,68,68,0.1)] text-[rgb(248,113,113)]">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <h3 className="font-display text-xl font-bold text-cloud">{p.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-slatey">{p.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
