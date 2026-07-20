"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/ui/Section";
import { Raio } from "@/components/Brand";
import { WaveField } from "@/components/WaveField";
import { Plans } from "@/components/Plans";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

/**
 * Landing dedicada B2C (/para-voce). Diferente da página de empresas, aqui a
 * conversão é self-service: os CTAs levam à seção de planos da home, onde a
 * pessoa adiciona o plano ao carrinho e finaliza a compra. O ângulo é pessoal —
 * energia no dia a dia, home office, autoconhecimento — e não gestão/lei.
 *
 * As features descrevem o que o painel individual entrega de verdade:
 * leitura ao vivo de humor/postura/energia (100% local), exercícios, Pausa
 * Mental, Modo Foco, University, dashboard pessoal e conquistas.
 */
export function ParaVoceContent() {
  return (
    <main id="topo">
      <ParaVoceHero />
      <ProblemaSection />
      <ComoAjuda />
      <Recursos />
      <PrivacidadePessoal />
      <Plans />
      <ParaVoceFinalCTA />
    </main>
  );
}

/* ─────────────────────────────  HERO  ───────────────────────────── */

function ParaVoceHero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-40 lg:pb-28">
      <WaveField baseYFactor={0.88} intensity={0.75} />

      <div className="relative mx-auto grid max-w-[88rem] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-slatey backdrop-blur-sm"
          >
            <Raio size={14} /> StamFlow para você
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-7 max-w-xl font-display text-5xl font-bold leading-[1.05] text-cloud sm:text-6xl"
          >
            Sua energia produtiva, <span className="text-raio">lida pela câmera</span>.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-base leading-relaxed text-slatey sm:text-lg"
          >
            O StamFlow acompanha seu humor, sua postura e sua energia enquanto
            você trabalha — e sugere o exercício, o foco ou a pausa certa na hora
            certa. Tudo processado no seu navegador, só para os seus olhos.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#planos" className="btn-primary px-8 py-4 text-base">
              Começar a Jornada
            </a>
            <a href="#recursos" className="btn-ghost px-8 py-4 text-base">
              Ver o que você ganha
            </a>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-5 text-sm text-muted">
            Funciona no seu computador · leitura 100% local · cancele quando quiser
          </motion.p>
        </motion.div>

        <EnergyMeter />
      </div>
    </section>
  );
}

/* ─────────────  ENERGY METER (recorte do painel individual)  ───────────── */

const SPECTRUM =
  "linear-gradient(90deg, #f87171 0%, #fb923c 26%, #fbbf24 52%, #34d399 100%)";

const BODY_ROWS = [
  { label: "Ombros", status: "Perfeito", color: "#34d399" },
  { label: "Cabeça", status: "Bom", color: "#34d399" },
  { label: "Coluna lombar", status: "Atenção", color: "#fbbf24" },
] as const;

function EnergyMeter() {
  const reduce = useReducedMotion();
  const value = 84;

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div className="surface-card p-7 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-slatey">
            Checkup Scan
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-2/60 px-3 py-1.5 text-[12px] font-medium text-slatey">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-signal" />
            Ao vivo
          </span>
        </div>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-display text-[64px] font-bold leading-none text-cloud tabular-nums">
            {value}
          </span>
          <span className="text-lg text-muted">/100</span>
        </div>
        <p className="mt-1.5 text-[15px] text-slatey">Sua energia agora</p>

        <div className="relative mt-5">
          <div className="h-2.5 rounded-full opacity-90" style={{ background: SPECTRUM }} />
          <motion.span
            initial={{ left: "6%" }}
            animate={{ left: `${value}%` }}
            transition={{ duration: reduce ? 0 : 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 h-[18px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cloud shadow-[0_0_0_3px_rgba(11,17,32,0.9)]"
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] uppercase tracking-wider text-muted">
          <span>Crítico</span>
          <span>Perfeito</span>
        </div>

        <ul className="mt-6 divide-y divide-hairline border-t border-hairline">
          {BODY_ROWS.map((row, i) => (
            <motion.li
              key={row.label}
              initial={{ opacity: 0, x: reduce ? 0 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.55 + i * 0.12 }}
              className="flex items-center justify-between py-3.5"
            >
              <span className="text-[15px] text-slatey">{row.label}</span>
              <span className="inline-flex items-center gap-2 text-[14px] font-medium text-cloud">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                {row.status}
              </span>
            </motion.li>
          ))}
        </ul>

        <p className="mt-5 text-[12.5px] text-muted">
          Leitura feita pela câmera, 100% no seu navegador.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.15 }}
        className="absolute -bottom-5 left-5 right-5 sm:left-auto sm:right-8 sm:w-max"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-ink/95 px-4 py-3 shadow-lift backdrop-blur-md">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-signal/15 text-signal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13.5 2L4 13.2h6.2L9.5 22 20 10.4h-6.7L13.5 2Z" fill="currentColor" />
            </svg>
          </span>
          <div className="text-[13px] leading-tight">
            <p className="font-semibold text-cloud">Boost sugerido</p>
            <p className="mt-0.5 text-slatey">Pausa Mental · 2 min</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────────  O PROBLEMA  ───────────────────────── */

function ProblemaSection() {
  const dores = [
    "A tarde chega e a energia despenca, mas você só percebe quando já rendeu menos.",
    "Horas na mesma posição — e a conta chega em dor nas costas e no pescoço.",
    "Você esquece de pausar, respirar, levantar. O dia passa no automático.",
  ];

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow">
              <span className="eyebrow-tick" /> Soa familiar?
            </p>
            <h2 className="mt-5 font-display font-bold text-huge text-cloud">
              Seu corpo dá sinais o dia todo. <span className="text-raio">Você só não os vê.</span>
            </h2>
            <p className="mt-5 text-xl leading-relaxed text-slatey">
              Trabalhar horas na frente da tela cobra um preço silencioso — na
              postura, no humor, na energia. O StamFlow existe para tornar esses
              sinais visíveis, no momento em que ainda dá para agir.
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <ul className="space-y-4">
              {dores.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface/50 p-5 text-[15px] leading-relaxed text-slatey"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[rgba(239,68,68,0.1)] text-[rgb(248,113,113)]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────  COMO AJUDA  ──────────────────────── */

function ComoAjuda() {
  const steps = [
    {
      n: "01",
      title: "Abra e deixe rodar",
      body: "Com a câmera ligada, o StamFlow lê sua expressão e sua postura em tempo real enquanto você trabalha — sem tirar seu foco.",
    },
    {
      n: "02",
      title: "Receba o empurrão certo",
      body: "Energia caindo? Postura torta há tempo demais? Ele sugere um exercício, uma pausa mental ou um bloco de foco no momento em que faz diferença.",
    },
    {
      n: "03",
      title: "Veja sua evolução",
      body: "Seu painel mostra como seu humor e sua energia variam ao longo dos dias — e as conquistas que você desbloqueia mantendo o hábito.",
    },
  ];

  return (
    <section id="como-ajuda" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal className="text-center">
          <SectionHeading
            align="center"
            eyebrow="Como o StamFlow ajuda"
            title={
              <>
                Do sinal à ação, <span className="text-raio">sem esforço</span>.
              </>
            }
            description="Você não precisa parar para anotar nada. O StamFlow observa, entende e sugere — você só aproveita."
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
              transition={{ delay: i * 0.06 }}
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

/* ─────────────────────────────  RECURSOS  ───────────────────────── */

function Recursos() {
  const items = [
    {
      title: "Leitura ao vivo de humor e energia",
      body: "A câmera acompanha sua expressão e traduz em um retrato de como você está agora — não só como você acha que está.",
      icon: (
        <>
          <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        </>
      ),
    },
    {
      title: "Alerta de postura",
      body: "Passou tempo demais torto ou curvado? O StamFlow avisa antes de virar dor.",
      icon: (
        <path d="M12 5a2 2 0 100-4 2 2 0 000 4Zm-4 5l4-1 4 1M12 9v7m-3 4l3-4 3 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      title: "Exercícios guiados",
      body: "Alongamentos e pausas ativas rápidas, para fazer sem sair da mesa.",
      icon: (
        <path d="M6.5 6.5l11 11M4 9l2-2m12 12l2-2M9 4l-2 2m12 12l-2 2M3 12h2m14 0h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      title: "Pausa Mental e Foco",
      body: "Áudios de respiração para descomprimir e trilhas sonoras para entrar no ritmo.",
      icon: (
        <path d="M3 9c3 0 3 2.5 6 2.5S12 9 15 9s3 2.5 6 2.5M3 15c3 0 3 2.5 6 2.5s3-2.5 6-2.5 3 2.5 6 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ),
    },
    {
      title: "Seu painel de evolução",
      body: "Humor, energia e melhores dias ao longo do tempo — o seu histórico, só seu.",
      icon: (
        <path d="M4 20V10m5.5 10V4m5.5 16v-7M20.5 20v-4M2.5 20h19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ),
    },
    {
      title: "Conquistas que viram hábito",
      body: "Pequenas metas que transformam o cuidado com você em rotina que gruda.",
      icon: (
        <path d="M8 21h8m-4-4v4m-5-17h10v5a5 5 0 01-10 0V4Zm-3 2h3v3a3 3 0 01-3-3Zm16 0h-3v3a3 3 0 003-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
  ];

  return (
    <section id="recursos" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal className="text-center">
          <SectionHeading
            align="center"
            eyebrow="Tudo o que você ganha"
            title={
              <>
                Um estúdio de bem-estar <span className="text-raio">dentro do seu dia</span>.
              </>
            }
          />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              transition={{ delay: (i % 3) * 0.05 }}
              className="rounded-3xl border border-hairline bg-surface/50 p-6"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl border border-hairline bg-surface-2/50 text-brand-cyan">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {it.icon}
                </svg>
              </div>
              <h3 className="font-display text-base font-bold text-cloud">{it.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slatey">{it.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────  PRIVACIDADE PESSOAL  ─────────────────── */

function PrivacidadePessoal() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[64rem] px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="surface-card relative overflow-hidden p-8 text-center sm:p-14"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(52,211,153,0.5), rgba(56,189,248,0.4), transparent)",
            }}
          />
          <div className="relative">
            <span className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-signal/15 text-signal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3l7 3v5c0 4.4-3 8.4-7 9.5C8 19.4 5 15.4 5 11V6l7-3Zm-3 8.5l2.2 2.2L15.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="eyebrow justify-center">
              <span className="eyebrow-tick" /> A parte mais importante
            </p>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-bold leading-tight text-cloud sm:text-4xl">
              Sua câmera nunca sai do seu computador.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slatey">
              Toda a leitura de humor e postura acontece 100% dentro do seu
              navegador. Nenhuma imagem ou vídeo é enviado, gravado ou
              armazenado — nem por nós. O que fica com você é só o retrato da
              sua energia, para você entender melhor os seus dias.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────  CTA FINAL  ──────────────────────── */

function ParaVoceFinalCTA() {
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
              Sua energia merece esse cuidado.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slatey">
              Escolha o período que faz sentido para você — com tudo incluído e
              pagamento seguro pelo Mercado Pago. Cancele quando quiser.
            </p>
            <div className="mt-9 flex justify-center">
              <a href="#planos" className="btn-primary px-10 py-4 text-base">
                Escolher meu plano
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
