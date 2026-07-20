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
 * Nota sobre a NR-1/NR-28: o texto posiciona o StamFlow como INSTRUMENTO DE
 * APOIO ao monitoramento contínuo dos fatores psicossociais — nunca como algo
 * que "garante conformidade" ou substitui PGR, laudo técnico ou o SESMT/médico
 * do trabalho. Isso é deliberado para não criar promessa juridicamente
 * arriscada num material de venda.
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
      <ComoFunciona />
      <SolucaoDoisEmUm />
      <ROISection onCta={openEnterprise} />
      <Privacidade onCta={openEnterprise} />
      <DuvidasB2B />
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

/* ────────────────────────  INOVAÇÃO GLOBAL  ─────────────────────── */

function Inovacao() {
  const roles = [
    "Fisioterapeuta particular, atento à postura durante todo o período de trabalho.",
    "Personal trainer para fortalecer os músculos mais usados no dia a dia.",
    "Instrutor de meditação mindfulness, que entende a rotina de quem trabalha no computador.",
    "Coach de produtividade, acompanhando cada colaborador todos os dias.",
  ];
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Inovação global"
            title={
              <>
                O sistema de proteção da <span className="text-raio">saúde e produtividade</span> no trabalho.
              </>
            }
            description="Imagine que cada colaborador possa contar com um time de especialistas, te acompanhando todos os dias, da tela do computador."
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
      title: "Adequação às NR-1 e NR-28",
      body: "Canal de denúncias blindado e sigiloso, 100% em conformidade com a LGPD. Gera histórico de evidências de proteção ao funcionário e auxilia no combate ao stress, à sobrecarga e ao assédio.",
    },
    {
      title: "Proteção jurídica",
      body: "Implementação ou melhoria do Programa de Gerenciamento de Riscos (PGR), tratamento de abusos não reportados e redução do passivo oculto.",
    },
    {
      title: "Indicadores e escuta",
      body: "Indicadores-chave e recursos inovadores de escuta, proteção e gestão de crise — tudo em um só painel de gestão.",
    },
  ];
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Tudo que o RH precisa"
            title={
              <>
                E não é só isso. <span className="text-raio">O RH ganha um aliado</span>.
              </>
            }
            description="O StamFlow oferece à gestão de Recursos Humanos os recursos de proteção, conformidade e gestão de crise que a nova realidade exige."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
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
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Uma bomba-relógio na mão do RH"
            title={
              <>
                Há uma <span className="text-raio">epidemia silenciosa</span> se espalhando dentro das empresas.
              </>
            }
            description="Empresas brasileiras perdem cerca de R$ 100 bilhões por ano em prejuízos por afastamentos do trabalho. Dores nas costas ainda lideram, mas já são seguidas de perto por ansiedade, depressão e burnout."
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
              A <span className="text-raio">“cegueira gerencial”</span> deixa a gestão do RH e a liderança vulneráveis.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slatey">
              Sem monitoramento contínuo e ações de prevenção, os problemas só aparecem quando o atestado
              médico chega — ou quando o colaborador já não consegue mais estar presente. E tende a piorar.
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slatey">
              Com o início da fiscalização da NR-1, as empresas passam a ser responsáveis não só pela saúde
              física, mas também emocional de cada colaborador. Sua empresa está preparada para gerar
              evidências técnicas de prevenção ao burnout e à sobrecarga, ou está exposta a multas?
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

/* ─────────────────────────  COMO FUNCIONA  ────────────────────────── */

function ComoFunciona() {
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
    <section id="como-funciona" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <Reveal className="text-center">
          <SectionHeading
            align="center"
            eyebrow="Como funciona"
            title={
              <>
                Uma inteligência ativa de biofeedback, <span className="text-raio">que cuida em tempo real</span>.
              </>
            }
            description="O StamFlow é um sistema inovador de monitoramento preventivo que cuida do colaborador que trabalha no computador, em três etapas."
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

/* ─────────────────────────  SOLUÇÃO 2 EM 1  ────────────────────────── */

function SolucaoDoisEmUm() {
  const items = [
    {
      title: "Painel do Gestor (Relatórios)",
      body: "Visão macro anonimizada. Monitore o mapa de calor emocional da equipe e a ergonomia coletiva sem ferir a privacidade individual (LGPD friendly).",
    },
    {
      title: "Escalabilidade total",
      body: "Cadastro de colaboradores um a um, em massa, ou via planilha CSV para grandes operações.",
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
                Gera valor para o <span className="text-raio">colaborador e para o RH</span>.
              </>
            }
            description="Cada colaborador tem seu acesso particular e exclusivo. E o gestor de RH conta com um painel em nível gerencial, com recursos avançados."
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
    ["Absenteísmo", "Excesso de faltas e atestados por dores físicas.", "Programa de fortalecimento preventivo."],
    ["Presenteísmo", "Colaborador “logado”, mas exausto e improdutivo.", "Sistema induz o deep work, com pausas e modo foco."],
    ["Plano de saúde", "Aumento de custos por sinistralidade elevada.", "Redução de exames, pronto atendimento e tratamentos."],
    ["Turnover", "Perda de talentos e alto custo de recontratação.", "Aumento do eNPS e do senso de pertencimento."],
    ["Risco jurídico", "Processos por falta de prevenção do risco psicossocial.", "Histórico de evidências de proteção ao funcionário."],
    ["Compliance & ética", "Abusos não reportados e passivos ocultos.", "Canal de denúncias blindado e sigiloso."],
    ["Blindagem PGR", "Ausência ou carência de programa de gestão de riscos.", "Relatórios comparativos para o PGR/compliance."],
    ["Ativo ESG", "Baixa valorização perante investidores e mercado.", "Sustentabilidade humana e social."],
  ];
  return (
    <section className="py-24 sm:py-32">
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
            description="Veja onde a sua empresa “sangra” hoje e como o StamFlow reverte cada ponto, reduzindo riscos e potencializando a produtividade."
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
          Estudos de instituições como Deloitte, OMS, OSHA, Harvard Business Review e Washington State L&amp;I
          indicam que investimentos em prevenção mental, ergonomia ativa e compliance regulatório entregam
          retornos financeiros expressivos, transformando a saúde ocupacional de um custo passivo em um ativo.
          Os valores variam conforme o contexto de cada empresa.
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

/* ─────────────────────────  PRIVACIDADE  ────────────────────────── */

function Privacidade({ onCta }: { onCta: () => void }) {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-[72rem] px-6 sm:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow">
              <span className="eyebrow-tick" /> Segurança e privacidade absoluta
            </p>
            <h2 className="mt-5 font-display font-bold text-huge text-cloud">
              Cuidar do time <span className="text-raio">não é vigiar o time</span>.
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

function DuvidasB2B() {
  const faqs = [
    {
      q: "Como a StamFlow garante a conformidade com a LGPD e a privacidade dos colaboradores?",
      a: "A leitura biomecânica e de expressões é processada 100% localmente no navegador do usuário (edge computing). Nenhuma imagem, foto ou vídeo sai do computador do colaborador ou é enviada para os nossos servidores.",
    },
    {
      q: "Como o sistema auxilia na blindagem jurídica em relação às NRs 1 e 28?",
      a: "O StamFlow documenta de forma automatizada o engajamento do time nos protocolos e oferece relatórios analíticos que servem como apoio técnico auditável para o PGR (Programa de Gerenciamento de Riscos), ajudando a reduzir o risco de multas por negligência.",
    },
    {
      q: "O canal de denúncias é realmente anônimo?",
      a: "Sim. O colaborador pode relatar desvios, assédios ou falhas de infraestrutura sem medo de retaliações. O RH gerencia os relatos por um sistema interno de tickets em formato Kanban, respondendo dentro da plataforma sem que a identidade dele seja revelada.",
    },
    {
      q: "O gestor ou o RH conseguem vigiar individualmente o que o funcionário faz?",
      a: "De forma nenhuma. O StamFlow foi desenhado para proteger o colaborador e blindar a empresa, não para microgerenciamento. O painel do gestor entrega métricas de forma totalmente agregada e anonimizada.",
    },
    {
      q: "O software exige instalação complexa ou extensões pesadas?",
      a: "Não. O StamFlow roda direto no navegador (Chrome, Edge, etc.). Não há downloads ou instalações executáveis. O onboarding é feito via link, com login e senha individuais.",
    },
    {
      q: "Como funciona o modelo de contratação e faturamento para empresas?",
      a: "Operamos com contratos baseados no número de licenças ativas (colaboradores + gestores), com tabela de preço progressiva. Após a demonstração e o entendimento da necessidade do time, emitimos uma proposta customizada.",
    },
    {
      q: "Qual o prazo de implementação?",
      a: "Em geral, em poucos dias úteis após a contratação, a arquitetura para sua equipe, as hierarquias de acesso, os logins e o treinamento de onboarding estão concluídos.",
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
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-64 rounded-full bg-raio/15 blur-[100px]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight text-cloud sm:text-5xl">
              Eleve o cuidado com seus colaboradores agora.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slatey">
              Conte com o apoio da StamFlow para proteger sua equipe do stress, da sobrecarga e do burnout,
              enquanto eleva a disposição, o foco e a produtividade.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" onClick={onCta} className="btn-primary px-8 py-4 text-base">
                Assistir demo do sistema
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
