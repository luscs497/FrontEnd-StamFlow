"use client";

import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/ui/Section";
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
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div className="relative mx-auto max-w-[72rem] px-6 text-center sm:px-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="eyebrow justify-center"
        >
          <span className="eyebrow-tick" /> Saúde, segurança e produtividade
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.08] text-cloud sm:text-5xl"
        >
          Cuidar da saúde e segurança psicossocial da equipe, enquanto entrega{" "}
          <span className="text-raio">resultados para a empresa</span>, é um desafio para o seu RH?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slatey"
        >
          Conte com o apoio de um sistema inteligente e inovador para proteger sua equipe do stress,
          sobrecarga e burnout, enquanto eleva a disposição, o foco e a produtividade.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
            Agendar demonstração
          </button>
          <a href="#stamflow-b2b" className="btn-ghost px-8 py-4 text-base">
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

/* ────────────────────────  INOVAÇÃO GLOBAL  ─────────────────────── */

function Inovacao() {
  const roles = [
    "Fisioterapeuta particular, atento à postura durante todo o período de trabalho.",
    "Personal trainer para fortalecer os músculos mais usados no dia a dia.",
    "Instrutor de meditação mindfulness, que entende a rotina de quem trabalha no computador.",
    "Coach de produtividade, acompanhando cada colaborador todos os dias.",
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
            <motion.div key={r} variants={fadeUp} className="surface-card flex items-start gap-3.5 p-6">
              <span className="mt-0.5 shrink-0 text-brand-cyan">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-[15px] leading-relaxed text-slatey">{r}</p>
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
    },
    {
      title: "Proteção jurídica",
      body: "Implementação ou melhoria do Programa de Gerenciamento de Risco (PGR), tratamento de abusos não reportados e redução do passivo oculto.",
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
              <h3 className="font-display text-xl font-bold text-cloud">{it.title}</h3>
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

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="surface-card p-8">
            <p className="eyebrow"><span className="eyebrow-tick" /> Ergonomia</p>
            <ul className="mt-5 space-y-4">
              <StatLine value="Nº 1" text="Dor nas costas é a maior causa de incapacidade do mundo." />
              <StatLine value="70–85%" text="da população sofre ou sofrerá com hérnias e lombalgias." />
            </ul>
          </div>
          <div className="surface-card p-8">
            <p className="eyebrow"><span className="eyebrow-tick" /> Saúde emocional</p>
            <ul className="mt-5 space-y-4">
              <StatLine value="8 em 10" text="brasileiros enfrentam estresse no trabalho." />
              <StatLine value="32%" text="dos profissionais apresentam sintomas de burnout." />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatLine({ value, text }: { value: string; text: string }) {
  return (
    <li className="flex items-baseline gap-4">
      <span className="min-w-[5.5rem] font-display text-2xl font-bold text-raio tabular-nums">{value}</span>
      <span className="text-[15px] leading-relaxed text-slatey">{text}</span>
    </li>
  );
}

/* ─────────────────────────────  NR-1  ───────────────────────────── */

function NR1Section({ onCta }: { onCta: () => void }) {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <div className="surface-card overflow-hidden p-9 sm:p-14">
          <Reveal>
            <p className="eyebrow">
              <span className="eyebrow-tick" /> A bomba-relógio tem data para explodir
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

/* ─────────────────────  SAÚDE E PRODUTIVIDADE (BOOSTS)  ───────────────── */

function BoostsB2B() {
  const boosts = [
    {
      title: "Modo Foco",
      body: "Trilhas binaurais e ruído branco para blindar o cérebro contra distrações.",
    },
    {
      title: "Corpo Saudável",
      body: "Protocolos validados de exercícios de fortalecimento e oxigenação.",
    },
    {
      title: "Pausa Mental",
      body: "Áudios guiados de meditação mindfulness para limpar o “cache” cerebral.",
    },
    {
      title: "StamFlow University",
      body: "Curadoria com as maiores estratégias mundiais de melhora de hábitos, sono e foco.",
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
              <span className="font-display text-2xl font-bold text-raio tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-cloud">{b.title}</h3>
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
    },
    {
      title: "Escalabilidade total",
      body: "Cadastro simplificado de colaboradores um a um, em massa, ou via planilha CSV para grandes operações.",
    },
    {
      title: "Canal de denúncias seguro",
      body: "Ferramenta sigilosa e anônima para relatos de assédio ou infraestrutura, com gestão prática dos tickets (compliance e ESG).",
    },
    {
      title: "Treinamento de compliance",
      body: "Biblioteca com protocolos para a liderança conduzir situações delicadas de forma ética e eficiente.",
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
              <h3 className="font-display text-lg font-bold text-cloud">{it.title}</h3>
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
        <div className="mt-12 space-y-4">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.35, delay: (i % 4) * 0.04 }}
              className="surface-card p-6"
            >
              <h3 className="font-display text-lg font-bold text-cloud">{f.q}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slatey">{f.a}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
            Solicitar Demo do sistema
          </button>
        </div>
      </div>
    </section>
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
