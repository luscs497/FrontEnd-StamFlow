"use client";

import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/ui/Section";
import { EnergyWave } from "@/components/EnergyWave";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export function Features() {
  return (
    <section id="recursos" className="py-28 sm:py-36">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="O que o StamFlow enxerga"
            title={
              <>
                Quatro pontos do corpo, <span className="text-raio">um ritmo</span> só.
              </>
            }
            description="Ombros, cabeça, coluna e rotação do tronco — cada um com seu próprio status. Juntos, formam um retrato honesto de como está a sua energia agora."
          />
        </Reveal>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-5 lg:grid-cols-3"
        >
          {/* Tile grande: índice de energia (conceito central) */}
          <motion.div
            variants={fadeUp}
            className="surface-card flex flex-col justify-between overflow-hidden p-8 lg:col-span-2 lg:row-span-2"
          >
            <div>
              <span className="eyebrow">
                <span className="eyebrow-tick" /> Conceito central
              </span>
              <h3 className="mt-5 font-display text-[26px] font-bold text-cloud sm:text-[32px]">
                O índice de energia
              </h3>
              <p className="mt-3.5 max-w-md text-base leading-relaxed text-slatey">
                Cada parte do corpo recebe um status — de perfeito a crítico — a cada poucos segundos.
                Tudo isso se condensa num número só: a sua stamina do momento.
              </p>
            </div>
            <div className="mt-8">
              <div className="mb-3 flex items-end justify-between">
                <span className="text-[15px] text-muted">Energia hoje</span>
                <span className="font-display text-[28px] font-bold text-raio tabular-nums">72</span>
              </div>
              <EnergyWave variant="divider" className="h-24 w-full" />
            </div>
          </motion.div>

          <FeatureTile
            title="Postura, ponto a ponto"
            body="Ombros, cabeça, coluna e rotação do tronco — cada um avaliado por conta própria. O StamFlow percebe quando você começa a se curvar, antes de você sentir."
            icon={
              <path d="M12 5a2 2 0 100-4 2 2 0 000 4Zm-4 5l4-1 4 1M12 9v7m-3 4l3-4 3 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            }
          />

          <FeatureTile
            title="Humor pela expressão"
            body="A leitura facial capta tensão, cansaço e foco a cada poucos segundos. Não para te julgar — para saber a hora certa de sugerir um respiro."
            icon={
              <>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8.5 14.5s1.3 1.5 3.5 1.5 3.5-1.5 3.5-1.5M9 9.5h.01M15 9.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </>
            }
          />

          <motion.div variants={fadeUp} className="surface-card p-8 lg:col-span-3">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-3">
                  <Glyph>
                    <path d="M11 3L4 14h6l-1 7 8-12h-6l1-6Z" fill="currentColor" />
                  </Glyph>
                  <h3 className="font-display text-2xl font-bold text-cloud">Sugestões na hora certa</h3>
                </div>
                <p className="mt-3.5 text-base leading-relaxed text-slatey">
                  Quando a energia cai, o StamFlow propõe a ação certa para o momento — uma pausa curta, uma
                  respiração guiada ou um exercício rápido. Sem culpa, sem alarme.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {["Pausa de 2 min", "Respiração guiada", "Alongar pescoço", "Olhar o horizonte"].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-hairline bg-surface-2/40 px-4 py-2.5 text-[15px] font-medium text-cloud"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Trilhas de conteúdo guiado: Exercícios, Pausa Mental, Foco, University */}
          <motion.div variants={fadeUp} className="surface-card p-8 lg:col-span-3">
            <div className="flex items-center gap-3">
              <Glyph>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
              </Glyph>
              <h3 className="font-display text-2xl font-bold text-cloud">Trilhas para recuperar o ritmo</h3>
            </div>
            <p className="mt-3.5 max-w-xl text-base leading-relaxed text-slatey">
              Quatro espaços guiados, prontos quando a energia pedir uma pausa de verdade.
            </p>
            <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { t: "Exercícios", d: "Alongamentos curtos para pescoço, ombros e costas." },
                { t: "Pausa Mental", d: "Respiração guiada por áudio, em poucos minutos." },
                { t: "Foco", d: "Trilhas ambientes para entrar no ritmo de trabalho." },
                { t: "StamFlow University", d: "Resumos guiados sobre atenção, hábito e energia." },
              ].map((item) => (
                <div key={item.t} className="rounded-field border border-hairline bg-surface-2/40 p-5">
                  <p className="text-[15px] font-semibold text-cloud">{item.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slatey">{item.d}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureTile({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeUp} className="surface-card p-8">
      <Glyph>{icon}</Glyph>
      <h3 className="mt-5 font-display text-2xl font-bold text-cloud">{title}</h3>
      <p className="mt-3.5 text-base leading-relaxed text-slatey">{body}</p>
    </motion.div>
  );
}

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-hairline bg-surface-2/50 text-brand-cyan">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {children}
      </svg>
    </span>
  );
}
