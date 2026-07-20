"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/ui/Section";
import { Raio } from "@/components/Brand";
import { WaveField } from "@/components/WaveField";
import { useModals } from "@/components/Providers";
import { LOGIN_URL } from "@/lib/config";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

/**
 * Landing dedicada B2B (/empresas). Funil consultivo: a empresa fala com o
 * time, agenda uma demonstração ao vivo e fecha um pacote por licenças.
 * Todos os CTAs abrem o EnterpriseModal (contato).
 *
 * A copy e a ordem das seções seguem o documento oficial
 * "(Copy) LP Corporativo B2B - StamFlow.docx"; os ids das seções são as
 * âncoras do menu corporativo (NAV_EMPRESAS em lib/config.ts).
 */
export function EmpresasContent() {
  const { openEnterprise } = useModals();

  return (
    <main id="topo">
      <EmpresasHero onCta={openEnterprise} />
      <Inovacao />
      <TudoRH />
      <BombaRelogio />
      <NR1Section onCta={openEnterprise} />
      <Guardiao />
      <BoostsB2B />
      <SolucaoDoisEmUm />
      <ROISection onCta={openEnterprise} />
      <PlanosCorporativos onCta={openEnterprise} />
      <TudoIncluidoB2B onCta={openEnterprise} />
      <DuvidasB2B onCta={openEnterprise} />
      <Privacidade onCta={openEnterprise} />
      <EmpresasFinalCTA onCta={openEnterprise} />
    </main>
  );
}

/* ─────────────────────────────  HERO  ───────────────────────────── */

function EmpresasHero({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-40 lg:pb-28">
      <WaveField baseYFactor={0.88} intensity={0.75} />

      <div className="relative mx-auto grid max-w-[88rem] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-slatey backdrop-blur-sm"
          >
            <Raio size={14} /> Saúde, segurança e produtividade
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-7 max-w-2xl font-display text-4xl font-bold leading-[1.08] text-cloud sm:text-5xl"
          >
            Cuidar da saúde e segurança psicossocial da equipe, enquanto entrega{" "}
            <span className="text-raio">resultados para a empresa</span>, é um desafio para o seu RH?
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-base leading-relaxed text-slatey sm:text-lg"
          >
            Conte com o apoio de um sistema inteligente e inovador para proteger sua equipe do stress,
            sobrecarga e burnout, enquanto eleva a disposição, o foco e a produtividade.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
              Agendar demonstração
            </button>
            <a href="#stamflow-b2b" className="btn-ghost px-8 py-4 text-base">
              Ver como funciona
            </a>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-5 text-sm text-muted">
            Atendimento consultivo · pacotes por licença · sem cartão para conversar
          </motion.p>
        </motion.div>

        <RelatorioPanel />
      </div>
    </section>
  );
}

/* Painel ilustrativo da hero: a aba Relatório Comparativo do gestor
   (a "[IMAGEM DO SISTEMA]" indicada no doc de copy para esta seção). */
function RelatorioPanel() {
  const rows = [
    { label: "Energia produtiva", before: 58, after: 74 },
    { label: "Ergonomia (postura)", before: 61, after: 79 },
    { label: "Indicativo de humor", before: 64, after: 81 },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div className="surface-card p-7 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-slatey">
            Relatório comparativo
          </span>
          <span className="rounded-full border border-hairline bg-surface-2/60 px-3 py-1.5 text-[12px] font-medium text-slatey">
            Trimestre × trimestre
          </span>
        </div>

        <div className="mt-7 space-y-6">
          {rows.map((row, i) => (
            <div key={row.label}>
              <div className="mb-2 flex items-center justify-between text-[13.5px]">
                <span className="text-slatey">{row.label}</span>
                <span className="tabular-nums text-muted">
                  {row.before} → <span className="font-semibold text-cloud">{row.after}</span>
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.before}%` }}
                    transition={{ duration: 0.7, delay: 0.45 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-slatey/40"
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.after}%` }}
                    transition={{ duration: 0.7, delay: 0.6 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-raio"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between border-t border-hairline pt-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/15 px-3 py-1.5 text-[13px] font-semibold text-signal">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 9l3.5-3.5L8 8l4-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            +16 pts de energia média
          </span>
          <span className="text-[12px] text-muted">Dados agregados</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
        className="absolute -bottom-5 left-5 right-5 sm:left-auto sm:right-8 sm:w-max"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-ink/95 px-4 py-3 shadow-lift backdrop-blur-md">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-signal/15 text-signal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="text-[13px] leading-tight">
            <p className="font-semibold text-cloud">Evidência para o PGR</p>
            <p className="mt-0.5 text-slatey">Exportada em PDF ou CSV</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────  INOVAÇÃO GLOBAL  ─────────────────────── */

function Inovacao() {
  const roles = [
    {
      text: "Fisioterapeuta particular, atento à postura durante todo o período de trabalho.",
      icon: (
        <path d="M12 5a2 2 0 100-4 2 2 0 000 4Zm-4 5l4-1 4 1M12 9v7m-3 4l3-4 3 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      text: "Personal trainer para fortalecer os músculos mais usados no dia a dia.",
      icon: (
        <path d="M6.5 6.5l11 11M4 9l2-2m12 12l2-2M9 4l-2 2m12 12l-2 2M3 12h2m14 0h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      text: "Instrutor de meditação mindfulness, que entende a rotina de quem trabalha no computador.",
      icon: (
        <>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 14.5s1.3 1.5 3.5 1.5 3.5-1.5 3.5-1.5M9 9.5h.01M15 9.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ),
    },
    {
      text: "Coach de produtividade, acompanhando cada colaborador todos os dias.",
      icon: (
        <path d="M13.5 2L4 13.2h6.2L9.5 22 20 10.4h-6.7L13.5 2Z" fill="currentColor" />
      ),
    },
  ];
  return (
    <section id="inovacao" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Inovação global"
            title={
              <>
                Conheça StamFlow, o sistema de <span className="text-raio">proteção da saúde e produtividade</span>, durante a jornada de trabalho no computador.
              </>
            }
            description="Imagine que cada colaborador possa contar com um fisioterapeuta particular, atento a sua postura durante todo período de trabalho, mais um personal trainer para fortalecer seus músculos mais usados, um instrutor de meditação mindfulness que entende exatamente a rotina de um trabalhador de computador, e um coach de produtividade. Lhe acompanhando todos os dias, da tela do computador."
          />
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid gap-5 sm:grid-cols-2"
        >
          {roles.map((r) => (
            <motion.div key={r.text} variants={fadeUp} className="surface-card flex items-start gap-4 p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-hairline bg-surface-2/50 text-brand-cyan">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {r.icon}
                </svg>
              </span>
              <p className="pt-1 text-[15px] leading-relaxed text-slatey">{r.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────  TUDO QUE O RH PRECISA  ─────────────────────── */

function TudoRH() {
  const items = [
    {
      title: "Adequação às NR1 e NR28",
      body: "Um sistema que oferece Canal de denúncias blindado e sigiloso, 100% em conformidade com a LGPD. Gerando histórico de evidências de proteção ao funcionário e auxiliando no combate do stress, sobrecarga e assédio.",
      icon: (
        <path d="M12 3l7 3v5c0 4.4-3 8.4-7 9.5C8 19.4 5 15.4 5 11V6l7-3Zm-3 8.5l2.2 2.2L15.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      title: "Proteção jurídica",
      body: "Implementação ou melhoria do Programa de Gerenciamento de Risco (PGR), tratamento de abusos não reportados e redução do passivo oculto.",
      icon: (
        <path d="M12 3v18M5 21h14M7 7l-3 6h6l-3-6Zm10 0l-3 6h6l-3-6ZM8 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
  ];
  return (
    <section id="pgr" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Tudo que o RH precisa"
            title={
              <>
                E não é só isso. StamFlow oferece à <span className="text-raio">gestão dos Recursos Humanos</span>: indicadores-chave e recursos inovadores de escuta, proteção e gestão de crise.
              </>
            }
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              transition={{ delay: i * 0.05 }}
              className="surface-card p-8"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-hairline bg-surface-2/50 text-brand-cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {it.icon}
                </svg>
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-cloud">{it.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slatey">{it.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────  BOMBA-RELÓGIO (DADOS)  ─────────────────────── */

function BombaRelogio() {
  return (
    <section id="crise" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Uma bomba-relógio na mão do RH"
            title={
              <>
                Há uma <span className="text-raio">epidemia silenciosa</span> se espalhando dentro das empresas.
              </>
            }
            description="Empresas brasileiras perdem R$ 100 bilhões/ano em prejuízos por afastamentos do trabalho. Dores nas costas, hérnias e lombalgias ainda lideram as causas de afastamento, mas já são seguidas de perto pelas crises de ansiedade, depressão, burnout e outras doenças da mente."
          />
        </Reveal>

        {/* Cores do espectro de energia: âmbar (atenção) para a dor física,
            vermelho (crítico) para a saúde emocional. */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="surface-card relative overflow-hidden p-8">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#fbbf24]/50 to-transparent" />
            <p className="eyebrow">
              <span className="h-[6px] w-[6px] rounded-full bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.7)]" /> Ergonomia
            </p>
            <ul className="mt-5 space-y-4">
              <StatLine tone="#fbbf24" value="Nº 1" text="Dor nas costas é a maior causa de incapacidade do mundo." />
              <StatLine tone="#fbbf24" value="70–85%" text="da população sofre ou sofrerá com hérnias e lombalgias." />
            </ul>
          </div>
          <div className="surface-card relative overflow-hidden p-8">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f87171]/50 to-transparent" />
            <p className="eyebrow">
              <span className="h-[6px] w-[6px] rounded-full bg-[#f87171] shadow-[0_0_10px_rgba(248,113,113,0.7)]" /> Saúde emocional
            </p>
            <ul className="mt-5 space-y-4">
              <StatLine tone="#f87171" value="8 em 10" text="brasileiros enfrentam estresse no trabalho." />
              <StatLine tone="#f87171" value="32%" text="dos profissionais apresentam sintomas de burnout." />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatLine({ value, text, tone }: { value: string; text: string; tone?: string }) {
  return (
    <li className="flex items-baseline gap-4">
      <span
        className="min-w-[5.5rem] font-display text-2xl font-bold tabular-nums"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </span>
      <span className="text-[15px] leading-relaxed text-slatey">{text}</span>
    </li>
  );
}

/* ─────────────────────────────  NR-1  ───────────────────────────── */

function NR1Section({ onCta }: { onCta: () => void }) {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <div className="surface-card relative overflow-hidden p-9 sm:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(248,113,113,0.55), rgba(251,191,36,0.4), transparent)",
            }}
          />
          <Reveal>
            <p className="eyebrow">
              <span className="h-[6px] w-[6px] rounded-full bg-[#f87171] shadow-[0_0_10px_rgba(248,113,113,0.7)]" /> A bomba-relógio tem data para explodir
            </p>
            <h2 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight text-cloud sm:text-4xl">
              A <span className="text-raio">“cegueira gerencial”</span> deixa a gestão do RH e a liderança da empresa vulneráveis.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slatey">
              Sem monitoramento contínuo e ações de prevenção, os problemas só aparecem quando o atestado
              médico chega, ou quando o colaborador já não consegue mais estar presente. E vai piorar.
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slatey">
              Início da fiscalização punitiva da NR1: o prazo de adequação às novas normas da NR1 chegou ao
              fim. Agora as empresas são oficialmente responsáveis não só pela saúde física, mas também
              emocional de cada colaborador. Sua empresa está preparada para gerar evidências técnicas de
              prevenção ao burnout e sobrecarga, ou está exposta a multas iminentes?
            </p>
            <div className="mt-8">
              <button type="button" onClick={onCta} className="btn-primary px-7 py-3.5 text-base">
                Quero preparar minha empresa
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ────────────────  O GUARDIÃO DO RH, EM TEMPO INTEGRAL  ─────────────── */

function Guardiao() {
  const steps = [
    {
      n: "01",
      title: "Proteção (Checkup Scan)",
      body: "Analisa em tempo real, via webcam, a ergonomia e a biomecânica — com processamento local, 100% de privacidade e segurança.",
    },
    {
      n: "02",
      title: "Engajamento (Barra de Stamina)",
      body: "Gamefica o bem-estar e a energia produtiva, de forma simples. O sistema entende, em segundos, quando o colaborador precisa de uma recarga.",
    },
    {
      n: "03",
      title: "Intervenção (Boosts de Energia)",
      body: "Antes da dor ou da fadiga surgirem, o StamFlow sugere breves pausas estratégicas que recarregam a energia física e emocional.",
    },
  ];

  return (
    <section id="stamflow-b2b" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal className="text-center">
          <SectionHeading
            align="center"
            eyebrow="O guardião do RH, em tempo integral"
            title={
              <>
                Cuidando individualmente de cada colaborador, com ações preventivas e corretivas: <span className="text-raio">proteção que gera valor</span>.
              </>
            }
            description="O StamFlow é um sistema inovador de monitoramento preventivo. Uma inteligência ativa de biofeedback que cuida em tempo real do colaborador que trabalha no computador. Cuidado em 3 etapas:"
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
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
              <span className="font-display text-5xl font-bold text-raio/90 tabular-nums">{s.n}</span>
              <h3 className="mt-4 flex items-center gap-2.5 font-display text-xl font-bold text-cloud">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-signal/15 text-signal">
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6.2l2.2 2.2L9.5 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {s.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slatey">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────  SAÚDE E PRODUTIVIDADE (BOOSTS)  ───────────────── */

function BoostsB2B() {
  const boosts = [
    {
      title: "Modo Foco",
      body: "Trilhas binaurais e ruído branco para blindar o cérebro contra distrações.",
      icon: (
        <>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
        </>
      ),
    },
    {
      title: "Corpo Saudável",
      body: "Protocolos validados de exercícios de fortalecimento e oxigenação.",
      icon: (
        <path d="M6.5 6.5l11 11M4 9l2-2m12 12l2-2M9 4l-2 2m12 12l-2 2M3 12h2m14 0h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      title: "Pausa Mental",
      body: "Áudios guiados de meditação mindfulness para limpar o “cache” cerebral.",
      icon: (
        <path d="M3 9c3 0 3 2.5 6 2.5S12 9 15 9s3 2.5 6 2.5M3 15c3 0 3 2.5 6 2.5s3-2.5 6-2.5 3 2.5 6 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ),
    },
    {
      title: "StamFlow University",
      body: "Curadoria com as maiores estratégias mundiais de melhora de hábitos, sono e foco.",
      icon: (
        <path d="M4 6.5A2.5 2.5 0 016.5 4H20v13.5H6.5A2.5 2.5 0 004 20V6.5Zm0 11V20M8 8h8M8 11.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
  ];
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal className="text-center">
          <SectionHeading
            align="center"
            eyebrow="Saúde e produtividade"
            title={
              <>
                StamFlow auxilia a melhora da postura, o fortalecimento muscular, a oxigenação, a organização e a <span className="text-raio">manutenção do foco no trabalho</span>.
              </>
            }
            description="Os 4 Boosts de Saúde e Alta Performance:"
          />
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {boosts.map((b, i) => (
            <motion.div key={b.title} variants={fadeUp} className="surface-card p-7">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-hairline bg-surface-2/50 text-brand-cyan">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {b.icon}
                  </svg>
                </span>
                <span className="font-display text-lg font-bold text-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-cloud">{b.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slatey">{b.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────  SOLUÇÃO 2 EM 1  ────────────────────────── */

function SolucaoDoisEmUm() {
  const items = [
    {
      title: "Painel do Gestor (Relatórios)",
      body: "Visão macro anonimizada. Monitore o mapa de calor emocional da equipe e a ergonomia coletiva sem ferir a privacidade individual (LGPD friendly).",
      icon: (
        <path d="M4 20V10m5.5 10V4m5.5 16v-7M20.5 20v-4M2.5 20h19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ),
    },
    {
      title: "Escalabilidade total",
      body: "Cadastro simplificado de colaboradores um a um, em massa, ou via planilha CSV para grandes operações.",
      icon: (
        <path d="M9 11a3 3 0 100-6 3 3 0 000 6Zm-6 9c0-3 2.5-5 6-5s6 2 6 5M16.5 5.5a3 3 0 011.5 5.6M18 15.5c2.2.5 3.5 2 3.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      title: "Canal de denúncias seguro",
      body: "Ferramenta sigilosa e anônima para relatos de assédio ou infraestrutura, com gestão prática dos tickets (compliance e ESG).",
      icon: (
        <path d="M12 3l7 3v5c0 4.4-3 8.4-7 9.5C8 19.4 5 15.4 5 11V6l7-3Zm0 5v4m0 3h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      title: "Treinamento de compliance",
      body: "Biblioteca com protocolos para a liderança conduzir situações delicadas de forma ética e eficiente.",
      icon: (
        <path d="M4 6.5A2.5 2.5 0 016.5 4H20v13.5H6.5A2.5 2.5 0 004 20V6.5Zm0 11V20M8 8h8M8 11.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
  ];
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Uma solução 2 em 1"
            title={
              <>
                StamFlow é um sistema que gera valor para o <span className="text-raio">colaborador e o RH</span>.
              </>
            }
            description="Cada colaborador tem seu acesso particular e exclusivo de seu sistema. E o(s) gestor(es) de RH têm acesso a um painel em nível gerencial, com recursos avançados:"
          />
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid gap-5 sm:grid-cols-2"
        >
          {items.map((it) => (
            <motion.div key={it.title} variants={fadeUp} className="surface-card p-7">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-hairline bg-surface-2/50 text-brand-cyan">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {it.icon}
                </svg>
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-cloud">{it.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slatey">{it.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────  ROI 12:1  ────────────────────────── */

function ROISection({ onCta }: { onCta: () => void }) {
  const rows = [
    ["Saúde física", "LER/DORT e afastamentos por hérnias e lombalgias.", "Prevenção da má postura e alertas de correção via IA."],
    ["Saúde mental", "Epidemia de stress, burnout e doenças da mente.", "Detecção precoce de esgotamento e recomendações via IA."],
    ["Absenteísmo", "Excesso de faltas e atestados médicos por dores físicas.", "Programa de fortalecimento preventivo."],
    ["Presenteísmo (prejuízo até 3x maior que o absenteísmo)", "Colaborador “logado”, mas exausto e improdutivo.", "Sistema induz o deep work, com pausas e modo foco."],
    ["Plano de saúde", "Aumento dos custos por sinistralidade elevada.", "Redução de exames, pronto atendimento e tratamentos."],
    ["Turnover", "Perda de talentos e alto custo de recontratação e treinamento.", "Aumento do eNPS, percepção de cuidado e senso de pertencimento."],
    ["Risco jurídico (ações trabalhistas)", "Processos trabalhistas por falta de prevenção do risco psicossocial.", "Histórico de evidências de proteção ao funcionário."],
    ["Compliance & ética", "Abusos não reportados e passivos ocultos.", "Canal de denúncias blindado e sigiloso."],
    ["Blindagem PGR", "Ausência ou carência de programa de gerenciamento de riscos.", "Relatórios comparativos de resultados das ações para o PGR/compliance."],
    ["Risco jurídico (MTE)", "Auditoria incisiva e punitiva do Ministério do Trabalho e Emprego (NR-1 e NR-28).", "Prevenção de multas por negligência ao combate do stress, sobrecarga e assédio."],
    ["Treinamento RH", "Custo com gestão de crises e atritos.", "Protocolos automáticos para casos graves."],
    ["Ativo ESG", "Baixa valorização perante investidores e mercado.", "Sustentabilidade humana e social."],
  ];
  return (
    <section id="roi" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[76rem] px-6 sm:px-10">
        <Reveal className="text-center">
          <SectionHeading
            align="center"
            eyebrow="Retorno sobre o investimento"
            title={
              <>
                ROI 12:1 — o impacto financeiro da <span className="text-raio">proteção dos ativos humanos</span>.
              </>
            }
            description="Veja como o StamFlow retorna múltiplas vezes o investimento, reduzindo os riscos e potencializando a produtividade:"
          />
        </Reveal>

        <div className="mt-12 overflow-hidden rounded-card border border-hairline">
          <div className="hidden grid-cols-3 gap-px bg-hairline sm:grid">
            <HeadCell>Pilar de ROI</HeadCell>
            <HeadCell>Onde a empresa “sangra” hoje</HeadCell>
            <HeadCell>Como o StamFlow reverte</HeadCell>
          </div>
          <div className="divide-y divide-hairline sm:divide-y-0">
            {rows.map((r, i) => (
              <motion.div
                key={r[0]}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.35, delay: (i % 5) * 0.03 }}
                className="grid gap-2 bg-surface/40 p-5 sm:grid-cols-3 sm:gap-px sm:bg-transparent sm:p-0"
              >
                <BodyCell><span className="font-semibold text-cloud">{r[0]}</span></BodyCell>
                <BodyCell><span className="text-slatey">{r[1]}</span></BodyCell>
                <BodyCell><span className="text-slatey">{r[2]}</span></BodyCell>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-muted">
          *Dados de instituições globais como Deloitte, OMS, OSHA, Harvard Business Review e Washington
          State L&amp;I comprovam que cada dólar investido em prevenção mental, ergonomia ativa e compliance
          regulatório entrega um retorno financeiro validado de até 18 vezes, transformando a saúde
          ocupacional de um custo passivo em um ativo de lucro.
        </p>

        <div className="mt-9 text-center">
          <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
            Agendar demonstração
          </button>
        </div>
      </div>
    </section>
  );
}

function HeadCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-2/60 px-5 py-4 text-[13px] font-semibold uppercase tracking-wider text-brand-cyan">
      {children}
    </div>
  );
}
function BodyCell({ children }: { children: React.ReactNode }) {
  return <div className="bg-surface/40 px-5 py-4 text-[15px] leading-relaxed sm:min-h-full">{children}</div>;
}

/* ────────────────────  PLANOS PARA EMPRESAS  ──────────────────── */

function PlanosCorporativos({ onCta }: { onCta: () => void }) {
  const planos = [
    {
      name: "Plano Pro",
      tag: "PMEs",
      price: "R$ 39,90",
      priceNote: "/ usuário mês",
      features: ["Checkup de Postura", "Alertas Inteligentes", "Boosts de Energia", "Relatório por período"],
      featured: false,
    },
    {
      name: "Plano Corporate",
      tag: "+100",
      price: "A partir de R$ 19,90",
      priceNote: "/ usuário mês",
      features: ["Tudo do Pro +", "Painel do Gestor", "Gestão de Acessos", "Comparação Evolutiva"],
      featured: true,
    },
    {
      name: "Plano Enterprise",
      tag: "",
      price: "Sob consulta",
      priceNote: "",
      features: ["Tudo do Corporate +", "Canal de Denúncias", "Evidência NR-1 Completa", "Treinamento Compliance"],
      featured: false,
    },
  ];
  return (
    <section id="planos-corporativos" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[76rem] px-6 sm:px-10">
        <Reveal className="text-center">
          <SectionHeading
            align="center"
            eyebrow="Baixo investimento e alto impacto"
            title={
              <>
                Planos para <span className="text-raio">Empresas</span>.
              </>
            }
            description="Proteja seu time, reduza os riscos e aumente a produtividade."
          />
        </Reveal>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {planos.map((p) => (
            <motion.div
              key={p.name}
              variants={fadeUp}
              className={`surface-card flex flex-col p-8 ${
                p.featured ? "border-raio/50 shadow-[0_16px_48px_-16px_rgba(124,58,237,0.45)]" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <h3 className="font-display text-xl font-bold text-cloud">{p.name}</h3>
                {p.tag && (
                  <span className="rounded-full border border-hairline bg-surface-2/50 px-2.5 py-1 text-[12px] font-semibold text-brand-cyan">
                    {p.tag}
                  </span>
                )}
              </div>
              <p className="mt-5">
                <span className="font-display text-3xl font-bold text-cloud">{p.price}</span>
                {p.priceNote && <span className="ml-1.5 text-sm text-muted">{p.priceNote}</span>}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px] leading-relaxed text-slatey">
                    <span className="mt-0.5 shrink-0 text-signal">
                      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M2.5 7.3l2.6 2.6L11.5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <Reveal delay={0.05} className="mt-10 text-center">
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slatey">
            <strong className="text-cloud">Agende uma demonstração</strong> e veja os dados de saúde e
            produtividade da sua equipe evoluírem em tempo real.
          </p>
          <button type="button" onClick={onCta} className="btn-primary mt-7 px-8 py-4 text-base">
            Assistir demo do sistema
          </button>
        </Reveal>
      </div>
    </section>
  );
}

/* ────────────────────  TUDO QUE ESTÁ INCLUÍDO  ──────────────────── */

function TudoIncluidoB2B({ onCta }: { onCta: () => void }) {
  const colaborador = [
    "Checkup de postura e energia em tempo real pela webcam",
    "Alertas de pausas, exercícios e conquistas",
    "Exercícios: protocolos para fortalecimento muscular e saúde",
    "Pausa Mental: áudios de respiração, meditação, foco e relaxamento",
    "Modo Foco: trilhas sonoras para aumento de concentração",
    "StamFlow University: conteúdo sobre hábitos, sono, foco e bem-estar",
    "Relatórios com histórico e tendências da sua energia",
    "Sistema de conquistas para acompanhar sua evolução",
    "Processamento 100% no seu navegador (nenhuma imagem sai do seu dispositivo)",
    "Suporte por chamados direto no painel",
  ];
  const gestores = [
    "Dois acessos: um de usuário, outro de gestor",
    "Controle para incluir/excluir novos usuários",
    "Visibilidade geral: acessos, engajamento, métricas globais",
    "Relatórios globais de energia produtiva, ergonomia, indicativos de humor",
    "Comparação por períodos (dia, semana, mês, trimestre, semestre, ano)",
    "Função exportar Relatórios (formatos CSV ou PDF)",
    "Gestão de denúncias anônimas em formato Kanban",
    "Treinamento de Compliance: como lidar com queixas de diferentes níveis",
    "Protocolo de Feedbacks para as 50 queixas mais comuns",
    "Suporte por atendimento de conta",
  ];
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[76rem] px-6 sm:px-10">
        <Reveal className="text-center">
          <SectionHeading
            align="center"
            eyebrow="Tudo que está incluído"
            title={
              <>
                Para cada colaborador <span className="text-raio">e para o(s) gestor(es)</span>.
              </>
            }
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            { title: "Para cada Colaborador", items: colaborador },
            { title: "Para o(s) Gestor(es)", items: gestores },
          ].map((col) => (
            <motion.div
              key={col.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="surface-card p-8"
            >
              <h3 className="font-display text-xl font-bold text-cloud">{col.title}</h3>
              <ul className="mt-6 space-y-3.5">
                {col.items.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px] leading-relaxed text-slatey">
                    <span className="mt-0.5 shrink-0 text-signal">
                      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M2.5 7.3l2.6 2.6L11.5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
            Agendar Demo
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  PRIVACIDADE  ────────────────────────── */

function Privacidade({ onCta }: { onCta: () => void }) {
  return (
    <section id="seguranca" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow">
              <span className="eyebrow-tick" /> Segurança e privacidade absoluta
            </p>
            <h2 className="mt-5 font-display font-bold text-huge text-cloud">
              Nenhum vídeo, imagem ou dado pessoal <span className="text-raio">sai do seu computador</span>.
            </h2>
            <p className="mt-5 text-xl leading-relaxed text-slatey">
              A leitura de postura e de expressão acontece inteiramente no navegador do usuário. Nenhum
              quadro de vídeo, nenhuma foto, nenhuma imagem ou dado é enviada para servidor algum — nem
              mesmo para o nosso.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Processamento 100% local, unicamente no dispositivo do usuário",
                "Zero upload de imagem, foto, vídeo ou dado pessoal",
                "O usuário concede e revoga o acesso à câmera quando quiser",
                "Os relatórios são somente dos dados globais, não do uso individual",
                "A privacidade do usuário é totalmente preservada (100% LGPD)",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] leading-relaxed text-slatey">
                  <span className="mt-0.5 shrink-0 text-signal">
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2.5 7.3l2.6 2.6L11.5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <button type="button" onClick={onCta} className="btn-ghost px-7 py-3.5 text-base">
                Quero conhecer
              </button>
            </div>
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
              Ilustração de painel agregado. Nenhum dado individual é exibido ao gestor.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  DÚVIDAS B2B  ────────────────────────── */

function DuvidasB2B({ onCta }: { onCta: () => void }) {
  const faqs = [
    {
      q: "Como a StamFlow garante a conformidade com a LGPD e a privacidade dos colaboradores?",
      a: "A segurança da informação é nossa prioridade absoluta. A leitura biomecânica e de expressões faciais é realizada via Edge Computing, ou seja, processada 100% localmente no navegador do usuário. Nenhuma imagem, foto ou transmissão de vídeo sai do computador do colaborador ou é enviada para os nossos servidores.",
    },
    {
      q: "Como o sistema auxilia na blindagem jurídica em relação às NRs 1 e 28?",
      a: "O StamFlow documenta de forma automatizada o engajamento do time nos protocolos ergonômicos e oferece relatórios analíticos que servem como prova técnica auditável para o PGR (Programa de Gerenciamento de Riscos), anulando o risco de multas fiscais por negligência.",
    },
    {
      q: "O Canal de Denúncias Seguro é realmente anônimo?",
      a: "Sim. O sistema utiliza criptografia de ponta a ponta para que o colaborador possa relatar desvios, assédios ou falhas de infraestrutura sem medo de retaliações. O RH gerencia os reports através de um sistema interno de tickets em formato Kanban, respondendo ao usuário dentro da plataforma sem que a identidade dele seja revelada em nenhum momento.",
    },
    {
      q: "O Gestor ou o RH conseguem vigiar individualmente o que o funcionário está fazendo?",
      a: "De forma nenhuma. O StamFlow foi desenhado para proteger o colaborador e blindar a empresa, não para microgerenciamento. O Painel do Gestor entrega métricas de saúde, ergonomia coletiva e mapa de calor emocional de forma totalmente agregada e anonimizada, preservando a relação de confiança entre a liderança e o time.",
    },
    {
      q: "O software exige instalação complexa ou extensões pesadas nas máquinas da empresa?",
      a: "Não. StamFlow é um sistema 100% em nuvem e roda direto no navegador (Chrome, Edge, etc.). Não há necessidade de downloads, instalações executáveis ou suporte presencial da sua equipe de TI. O onboarding é feito via link, com login e senha individuais.",
    },
    {
      q: "Como funciona o modelo de contratação e faturamento para empresas?",
      a: "Operamos com contratos anuais baseados no número de licenças ativas (colaboradores + gestores) com tabela de preço progressiva. Após o agendamento da demonstração e entendimento da necessidade do seu time, emitimos uma proposta customizada com faturamento mensal.",
    },
    {
      q: "Qual o prazo de implementação?",
      a: "Em até 7 dias úteis após a contratação toda a arquitetura do servidor exclusivo para sua equipe, as hierarquias de acessos de gestor(es) e usuários, todos os logins e senhas, e o treinamento de onboarding estarão concluídos.",
    },
  ];
  return (
    <section id="duvidas" className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        <Reveal className="text-center">
          <SectionHeading
            align="center"
            eyebrow="Dúvidas"
            title={
              <>
                Antes de você <span className="text-raio">começar</span>.
              </>
            }
          />
        </Reveal>
        <FaqAccordion faqs={faqs} />
        <div className="mt-10 text-center">
          <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
            Solicitar Demo do sistema
          </button>
        </div>
      </div>
    </section>
  );
}

/* Acordeão no mesmo padrão do FAQ da home, para consistência visual. */
function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Reveal delay={0.05} className="mt-12 divide-y divide-hairline border-y border-hairline">
      {faqs.map((item, i) => {
        const isOpen = open === i;
        const panelId = `b2b-faq-panel-${i}`;
        const btnId = `b2b-faq-btn-${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-6 text-left"
              >
                <span className="text-lg font-semibold text-cloud">{item.q}</span>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hairline text-slatey transition-transform duration-300 ${
                    isOpen ? "rotate-45 border-brand-cyan/50 text-brand-cyan" : ""
                  }`}
                  aria-hidden="true"
                >
                  <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-7 pr-10 text-base leading-relaxed text-slatey">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </Reveal>
  );
}

/* ─────────────────────────  CTA FINAL  ────────────────────────── */

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
          {/* Assinatura: linha fina do espectro de energia no topo do card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(52,211,153,0.5), rgba(251,191,36,0.45), rgba(248,113,113,0.4), transparent)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight text-cloud sm:text-5xl">
              Eleve o cuidado de seus colaboradores agora.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slatey">
              Conte com o apoio da StamFlow para proteger sua equipe do stress, sobrecarga e burnout,
              enquanto eleva a disposição, foco e produtividade.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
                Assistir demo do sistema
              </button>
              <a href={LOGIN_URL} className="btn-ghost px-8 py-4 text-base">
                Já sou cliente
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
