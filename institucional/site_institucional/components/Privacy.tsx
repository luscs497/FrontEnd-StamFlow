"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Section";
import { viewportOnce } from "@/lib/motion";

export function Privacy() {
  return (
    <section id="privacidade" className="py-28 sm:py-36">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10">
        <div className="surface-card overflow-hidden">
          <div className="grid items-center gap-10 p-9 sm:p-14 lg:grid-cols-2 lg:gap-16 lg:p-20">
            {/* Lado do texto */}
            <Reveal>
              <p className="eyebrow">
                <span className="eyebrow-tick" /> Privacidade por construção
              </p>
              <h2 className="mt-5 font-display font-bold text-huge text-cloud">
                Seu vídeo <span className="text-raio">nunca sai</span> do seu computador.
              </h2>
              <p className="mt-5 text-xl leading-relaxed text-slatey">
                A leitura de postura e de expressão acontece inteiramente no seu navegador. Nenhum quadro de
                vídeo, nenhuma foto, nenhuma imagem é enviada para servidor algum — nem para o nosso.
              </p>
              <ul className="mt-8 space-y-3.5">
                {[
                  "Processamento 100% local, no seu dispositivo",
                  "Zero upload de imagem ou vídeo",
                  "Você concede e revoga o acesso à câmera quando quiser",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-base text-cloud">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-signal/15 text-signal">
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2.5 6.2l2.2 2.2L9.5 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Lado do diagrama: o limite do dispositivo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative rounded-card border border-dashed border-brand-cyan/40 bg-ink/40 p-7">
                <span className="absolute -top-2.5 left-5 bg-surface px-2 text-[13px] font-semibold uppercase tracking-wider text-brand-cyan">
                  Seu dispositivo
                </span>

                <div className="flex items-center justify-between gap-4">
                  <Node label="Câmera" />
                  <Flow />
                  <Node label="Leitura" accent />
                  <Flow />
                  <Node label="Energia" />
                </div>

                <p className="mt-7 text-center text-base text-slatey">
                  Tudo o que você vê acontece aqui dentro.
                </p>
              </div>

              {/* O que tentaria sair — e é bloqueado */}
              <div className="mt-5 flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-hairline" />
                <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-4 py-2 text-[13px] font-medium text-[rgb(252,165,165)]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M3.2 3.2l7.6 7.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  Nenhum vídeo enviado
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-hairline" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Node({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <div
        className={`grid h-14 w-14 place-items-center rounded-2xl border sm:h-16 sm:w-16 ${
          accent ? "border-transparent bg-raio text-ink" : "border-hairline bg-surface-2/60 text-slatey"
        }`}
      >
        {accent ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M13.5 2L4 13.2h6.2L9.5 22 20 10.4h-6.7L13.5 2Z" fill="currentColor" />
          </svg>
        ) : (
          <span className="h-3 w-3 rounded-full bg-current" />
        )}
      </div>
      <span className="text-[13px] font-medium text-slatey">{label}</span>
    </div>
  );
}

function Flow() {
  return (
    <svg width="32" height="11" viewBox="0 0 28 10" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M0 5h22" stroke="rgba(148,163,184,0.4)" strokeWidth="1.4" strokeDasharray="3 3" />
      <path d="M20 1.5L26 5l-6 3.5" stroke="rgba(148,163,184,0.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
