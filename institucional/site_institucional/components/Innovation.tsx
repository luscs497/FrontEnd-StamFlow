"use client";

import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/ui/Section";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const ROLES = [
  {
    title: "Fisioterapeuta particular",
    body: "Atento à sua postura durante todo o período de trabalho.",
    icon: (
      <path d="M12 5a2 2 0 100-4 2 2 0 000 4Zm-4 5l4-1 4 1M12 9v7m-3 4l3-4 3 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Personal trainer",
    body: "Para fortalecer os músculos que você mais usa no dia a dia.",
    icon: (
      <path d="M6.5 6.5l11 11M4 9l2-2m12 12l2-2M9 4l-2 2m12 12l-2 2M3 12h2m14 0h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Instrutor de mindfulness",
    body: "Que entende exatamente a rotina de quem trabalha no computador.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 14.5s1.3 1.5 3.5 1.5 3.5-1.5 3.5-1.5M9 9.5h.01M15 9.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Coach de produtividade",
    body: "Te acompanhando todos os dias, da tela do seu computador.",
    icon: (
      <path d="M13.5 2L4 13.2h6.2L9.5 22 20 10.4h-6.7L13.5 2Z" fill="currentColor" />
    ),
  },
];

export function Innovation() {
  return (
    <section id="inovacao" className="py-28 sm:py-36">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Inovação global"
            title={
              <>
                O sistema de proteção da sua <span className="text-raio">saúde e produtividade</span>.
              </>
            }
            description="Imagine contar com um fisioterapeuta particular, um personal trainer, um instrutor de meditação mindfulness e um coach de produtividade — te acompanhando todos os dias, da tela do seu computador."
          />
        </Reveal>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ROLES.map((r) => (
            <motion.div key={r.title} variants={fadeUp} className="surface-card p-7">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-hairline bg-surface-2/50 text-brand-cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {r.icon}
                </svg>
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-cloud">{r.title}</h3>
              <p className="mt-2.5 text-base leading-relaxed text-slatey">{r.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
