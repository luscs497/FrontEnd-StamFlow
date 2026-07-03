"use client";

import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/ui/Section";
import { useModals } from "@/components/Providers";
import { TRIAL_DAYS } from "@/lib/config";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * Landing dedicada B2C (/para-voce). Diferente da página de empresas, aqui a
 * conversão é self-service: o CTA principal abre o TrialModal (começar o
 * teste grátis na hora), não um contato de vendas. O ângulo é pessoal —
 * energia no dia a dia, home office, autoconhecimento — e não gestão/lei.
 *
 * As features descrevem o que o painel individual entrega de verdade:
 * leitura ao vivo de humor/postura/energia (100% local), exercícios, Pausa
 * Mental, Modo Foco, University, dashboard pessoal e conquistas.
 */
export function ParaVoceContent() {
  const { openTrial } = useModals();

  return (
    <main id="topo">
      <ParaVoceHero onCta={openTrial} />
      <ProblemaSection />
      <ComoAjuda />
      <Recursos />
      <PrivacidadePessoal />
      <ParaVoceFinalCTA onCta={openTrial} />
    </main>
  );
}

/* ─────────────────────────────  HERO  ───────────────────────────── */

function ParaVoceHero({ onCta }: { onCta: () => void }) {
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
          <span className="eyebrow-tick" /> StamFlow para você
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.05] text-cloud sm:text-6xl"
        >
          Sua energia produtiva, <span className="text-raio">lida pela câmera</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slatey"
        >
          O StamFlow acompanha seu humor, sua postura e sua energia enquanto
          você trabalha — e sugere o exercício, o foco ou a pausa certa na hora
          certa. Tudo processado no seu navegador, só para os seus olhos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
            Começar teste grátis de {TRIAL_DAYS} dias
          </button>
          <a href="#recursos" className="btn-ghost px-8 py-4 text-base">
            Ver o que você ganha
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-5 text-sm text-muted"
        >
          Sem cartão para começar · funciona no seu computador · leitura 100% local
        </motion.p>
      </div>
    </section>
  );
}

/* ───────────────────────────  O PROBLEMA  ───────────────────────── */

function ProblemaSection() {
  const dores = [
    "A tarde chega e a energia despenca, mas você só percebe quando já rendeu menos.",
    "Horas na mesma posição — e a conta chega em dor nas costas e no pescoço.",
    "Você esquece de pausar, respirar, levantar. O dia passa no automático.",
    "No fim, fica a sensação de cansaço sem saber exatamente o porquê.",
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
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-raio" />
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

/* ─────────────────────────────  RECURSOS  ───────────────────────── */

function Recursos() {
  const items = [
    {
      title: "Leitura ao vivo de humor e energia",
      body: "A câmera acompanha sua expressão e traduz em um retrato de como você está agora — não só como você acha que está.",
    },
    {
      title: "Alerta de postura",
      body: "Passou tempo demais torto ou curvado? O StamFlow avisa antes de virar dor.",
    },
    {
      title: "Exercícios guiados",
      body: "Alongamentos e pausas ativas rápidas, para fazer sem sair da mesa.",
    },
    {
      title: "Pausa Mental",
      body: "Áudios de respiração e relaxamento para descomprimir em poucos minutos.",
    },
    {
      title: "Modo Foco",
      body: "Trilhas sonoras pensadas para entrar no ritmo e sustentar a concentração.",
    },
    {
      title: "StamFlow University",
      body: "Conteúdos curtos sobre ergonomia, energia e bem-estar no trabalho.",
    },
    {
      title: "Seu painel de evolução",
      body: "Humor, energia e melhores dias ao longo do tempo — o seu histórico, só seu.",
    },
    {
      title: "Conquistas",
      body: "Pequenas metas que transformam o cuidado com você em hábito que gruda.",
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

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              transition={{ delay: (i % 4) * 0.05 }}
              className="rounded-3xl border border-hairline bg-surface/50 p-6"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-raio/12 text-raio">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 10.5l3.5 3.5L16 5.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-signal/10 blur-3xl"
          />
          <div className="relative">
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

function ParaVoceFinalCTA({ onCta }: { onCta: () => void }) {
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
              Comece a cuidar da sua energia hoje.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slatey">
              {TRIAL_DAYS} dias grátis, com tudo liberado e sem cartão. Se fizer
              sentido para você, é só continuar.
            </p>
            <div className="mt-9 flex justify-center">
              <button type="button" onClick={onCta} className="btn-primary px-10 py-4 text-base">
                Começar teste grátis de {TRIAL_DAYS} dias
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
