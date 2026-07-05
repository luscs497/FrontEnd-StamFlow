"use client";

import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/ui/Section";
import { useModals } from "@/components/Providers";
import { LOGIN_URL } from "@/lib/config";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * Landing dedicada B2B (/empresas). Foco em conversão: o funil é consultivo
 * — a empresa fala com o time, agenda uma demonstração ao vivo e fecha um
 * pacote por licenças. Todos os CTAs abrem o EnterpriseModal (contato).
 *
 * Nota sobre a NR-1: o texto posiciona o StamFlow como INSTRUMENTO DE APOIO
 * ao monitoramento contínuo dos fatores psicossociais — nunca como algo que
 * "garante conformidade" ou substitui PGR, laudo técnico ou o SESMT/médico
 * do trabalho. Isso é deliberado para não criar promessa juridicamente
 * arriscada num material de venda.
 */
export function EmpresasContent() {
  const { openEnterprise } = useModals();

  return (
    <main id="topo">
      <EmpresasHero onCta={openEnterprise} />
      <NR1Section onCta={openEnterprise} />
      <ComoFunciona />
      <Privacidade />
      <EmpresasFinalCTA onCta={openEnterprise} />
    </main>
  );
}

/* ─────────────────────────────  HERO  ───────────────────────────── */

function EmpresasHero({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-raio/10 blur-[120px]"
      />
      <div className="relative mx-auto max-w-[72rem] px-6 text-center sm:px-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="eyebrow justify-center"
        >
          <span className="eyebrow-tick" /> StamFlow para empresas
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.05] text-cloud sm:text-6xl"
        >
          Você, conectado com <span className="text-raio">a sua empresa</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slatey"
        >
          Cada colaborador cuida da própria energia no dia a dia. O gestor
          acompanha a saúde do time de forma agregada — e ganha um apoio real
          para o monitoramento contínuo que a nova NR-1 passa a exigir.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
            Agendar demonstração ao vivo
          </button>
          <a href="#como-funciona" className="btn-ghost px-8 py-4 text-base">
            Ver como funciona
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-5 text-sm text-muted"
        >
          Atendimento consultivo · pacotes por licença · sem cartão para conversar
        </motion.p>
      </div>
    </section>
  );
}

/* ─────────────────────────────  NR-1  ───────────────────────────── */

function NR1Section({ onCta }: { onCta: () => void }) {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <div className="surface-card relative overflow-hidden p-8 sm:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-signal/10 blur-3xl"
          />
          <div className="relative">
            <span className="inline-flex w-fit items-center rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5 text-[13px] font-semibold text-signal">
              Nova NR-1 · vigência a partir de 26/05/2026
            </span>

            <h2 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight text-cloud sm:text-4xl">
              Saúde mental virou obrigação legal. E precisa ser documentada.
            </h2>

            <div className="mt-6 grid gap-6 text-lg leading-relaxed text-slatey lg:grid-cols-2 lg:gap-12">
              <p>
                A nova NR-1 passa a exigir que{" "}
                <strong className="text-cloud">toda empresa com empregados CLT</strong>{" "}
                identifique e gerencie os riscos psicossociais — sobrecarga,
                pressão, exaustão — no mesmo nível dos riscos físicos. Desde
                26/05/2026, a fiscalização é punitiva.
              </p>
              <p>
                A norma pede um processo{" "}
                <strong className="text-cloud">contínuo e documentado</strong>. É
                aí que o StamFlow ajuda: acompanhamento recorrente e dados
                agregados da equipe que apoiam esse monitoramento.
              </p>
            </div>

            {/* Nota de escopo honesta — sem prometer conformidade automática */}
            <p className="mt-7 max-w-3xl rounded-2xl border border-hairline bg-surface/40 p-5 text-[15px] leading-relaxed text-muted">
              O StamFlow é um <span className="text-slatey">instrumento de apoio</span> —
              não substitui o PGR, o laudo técnico nem o SESMT/medicina do
              trabalho. Ele complementa esse processo com dados contínuos que
              ajudam a sustentar a gestão de riscos psicossociais.
            </p>

            <button type="button" onClick={onCta} className="btn-primary mt-8 px-7 py-3.5 text-base">
              Entender como aplicamos na sua empresa
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  COMO FUNCIONA  ──────────────────────── */

function ComoFunciona() {
  const steps = [
    {
      n: "01",
      title: "Cada colaborador tem o próprio painel",
      body: "A pessoa acompanha humor, postura e energia em tempo real pela câmera — com exercícios, pausas e foco. Leitura 100% no navegador dela: nenhuma imagem sai do dispositivo.",
    },
    {
      n: "02",
      title: "O gestor vê a equipe, nunca o indivíduo",
      body: "Um painel próprio mostra energia média, humor, ergonomia e engajamento do time — sempre do grupo, nunca a leitura sensível de uma pessoa específica.",
    },
    {
      n: "03",
      title: "Relatórios que sustentam a NR-1",
      body: "Tendências ao longo do tempo, com registro contínuo — o tipo de acompanhamento documentado que a norma passa a exigir.",
    },
    {
      n: "04",
      title: "Gestão simples, por licenças",
      body: "Você contrata licenças de colaboradores e gestores, convida a equipe e ajusta conforme o time cresce — tudo em um só lugar, com nosso apoio no onboarding.",
    },
  ];

  return (
    <section id="como-funciona" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal className="text-center">
          <SectionHeading
            align="center"
            eyebrow="Como funciona"
            title={
              <>
                Tudo o que o time precisa, <span className="text-raio">nada que exponha ninguém</span>.
              </>
            }
            description="Do colaborador ao gestor, cada um enxerga o que faz sentido para o seu papel — com a privacidade preservada em todas as camadas."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              transition={{ delay: i * 0.05 }}
              className="surface-card p-8"
            >
              <span className="font-display text-2xl font-bold text-raio tabular-nums">{s.n}</span>
              <h3 className="mt-3 font-display text-xl font-bold text-cloud">{s.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slatey">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  PRIVACIDADE  ────────────────────────── */

function Privacidade() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow">
              <span className="eyebrow-tick" /> Privacidade em primeiro lugar
            </p>
            <h2 className="mt-5 font-display font-bold text-huge text-cloud">
              Cuidar do time <span className="text-raio">não é vigiar o time</span>.
            </h2>
            <p className="mt-5 text-xl leading-relaxed text-slatey">
              A leitura de humor, postura e energia acontece 100% no navegador
              do colaborador — nenhuma imagem ou vídeo sai do dispositivo dele.
              Para o gestor, só chega o retrato agregado da equipe. É assim que
              o StamFlow entrega cuidado coletivo sem transformar bem-estar em
              vigilância.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Processamento da câmera 100% local, no dispositivo da pessoa",
                "Gestor vê o agregado do time, nunca a leitura individual sensível",
                "Alinhado ao espírito da LGPD e da própria NR-1, que pedem indicadores coletivos",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] leading-relaxed text-slatey">
                  <span className="mt-0.5 shrink-0 text-signal">
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path
                        d="M2.5 7.3l2.6 2.6L11.5 4"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card p-8"
          >
            <p className="text-[15px] text-muted">Energia média da equipe</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-[56px] font-bold text-cloud tabular-nums">72</span>
              <span className="text-xl text-muted">/100</span>
            </div>
            <div className="mt-6 space-y-4">
              {[
                { label: "Bem-estar", value: 78 },
                { label: "Ergonomia (postura)", value: 65 },
                { label: "Engajamento", value: 81 },
              ].map((row, i) => (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="text-slatey">{row.label}</span>
                    <span className="text-muted tabular-nums">{row.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.value}%` }}
                      viewport={viewportOnce}
                      transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-raio"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[13px] leading-relaxed text-muted">
              Ilustração de painel agregado. Nenhum dado individual é exibido ao
              gestor.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function EmpresasFinalCTA({ onCta }: { onCta: () => void }) {
  return (
    <section className="pb-28 pt-8 sm:pb-36">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="surface-card relative overflow-hidden px-8 py-14 text-center sm:px-16 sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-64 rounded-full bg-raio/15 blur-[100px]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight text-cloud sm:text-5xl">
              Prepare a sua equipe — e a sua empresa — para a nova NR-1.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slatey">
              Agende uma demonstração ao vivo e veja, na prática, como o StamFlow
              cuida do time e apoia o seu monitoramento contínuo de bem-estar.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
                Agendar demonstração ao vivo
              </button>
              <a href={LOGIN_URL} className="btn-ghost px-8 py-4 text-base">
                Já sou cliente — entrar
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
