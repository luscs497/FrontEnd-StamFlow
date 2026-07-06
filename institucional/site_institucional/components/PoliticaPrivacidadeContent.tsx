"use client";

/**
 * ⚠️ VERSÃO PROVISÓRIA — NÃO É ACONSELHAMENTO JURÍDICO.
 *
 * Este documento foi redigido como um rascunho de boa-fé, com base no
 * funcionamento técnico atual do StamFlow. Ele DEVE ser revisado por um
 * advogado / DPO antes de ser considerado oficial. Não presuma que ele
 * cobre integralmente as obrigações da LGPD ou de qualquer outra lei.
 *
 */

import { motion } from "framer-motion";

const UPDATED_AT = "julho de 2026";

export function PoliticaPrivacidadeContent() {
  return (
    <main className="relative overflow-hidden pb-28 pt-32 sm:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-raio/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-[52rem] px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow"><span className="eyebrow-tick" /> Política de Privacidade</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-cloud sm:text-5xl">
            Seus dados, <span className="text-raio">no seu controle</span>.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slatey">
            Esta política explica quais dados o StamFlow trata, como e por quê.
            O ponto mais importante primeiro: a leitura da sua câmera acontece
            inteiramente no seu navegador — nenhuma imagem ou vídeo é enviado
            aos nossos servidores.
          </p>
          <p className="mt-3 text-sm text-muted">Última atualização: {UPDATED_AT}.</p>
        </motion.div>

        {/* Destaque do processamento local */}
        <div className="mt-10 rounded-3xl border border-hairline bg-surface/50 p-7 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-signal/12 text-signal">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-cloud">
                Processamento 100% no seu dispositivo
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slatey">
                A câmera é lida e analisada localmente, dentro do seu navegador.
                A detecção de postura e de expressões acontece ali mesmo, no seu
                computador. O que sai do dispositivo são apenas indicadores
                numéricos já processados (ex.: nível de energia, tendência de
                humor, ergonomia) — nunca a sua imagem.
              </p>
            </div>
          </div>
        </div>

        {/* Corpo */}
        <div className="mt-12 space-y-10">
          <Section title="1. Quem somos">
            <p>
              O StamFlow é um serviço operado por STAMFLOW SERVIÇOS EM INFORMÁTICA LTDA, inscrita no
              CNPJ 67.806.396/0001-30, com sede em Av. Engenheiro Roberto Freire, nº 1962, Loja 13, Cond. Seaway Shopping, Capim Macio, Natal - RN, CEP 59.082-095 (&quot;StamFlow&quot;,
              &quot;nós&quot;). Somos o controlador dos dados pessoais tratados
              conforme esta política, nos termos da Lei nº 13.709/2018 (LGPD).
            </p>
            <p>
              Para qualquer questão sobre privacidade ou exercício de direitos,
              o contato do nosso encarregado (DPO) é suporte@stamflow.com.br.
            </p>
          </Section>

          <Section title="2. A que este documento se aplica">
            <p>
              Esta política se aplica ao site institucional (stamflow.com.br) e
              aos painéis do produto (o painel individual, o painel de gestão e
              as áreas de acesso). Ao usar o StamFlow, você declara ter lido e
              compreendido as práticas aqui descritas.
            </p>
          </Section>

          <Section title="3. Como a leitura da câmera funciona">
            <p>
              O diferencial do StamFlow é que a análise de imagem é feita
              <strong className="text-cloud"> localmente, no seu navegador</strong>.
              Quando você ativa a câmera:
            </p>
            <ul className="mt-3 space-y-2">
              <Bullet>
                O vídeo é acessado e processado apenas no seu dispositivo, em
                tempo real, para estimar postura e expressões.
              </Bullet>
              <Bullet>
                Nenhum frame, foto ou gravação de vídeo é transmitido, salvo ou
                armazenado em nossos servidores.
              </Bullet>
              <Bullet>
                Ao final desse processamento local, apenas métricas numéricas
                agregadas são enviadas para que você possa acompanhar sua
                evolução ao longo do tempo (veja a seção 4).
              </Bullet>
              <Bullet>
                Você controla a câmera: pode desativá-la a qualquer momento, e o
                navegador exige sua permissão explícita para acessá-la.
              </Bullet>
            </ul>
          </Section>

          <Section title="4. Quais dados tratamos">
            <p>Tratamos as seguintes categorias de dados:</p>

            <SubTitle>a) Dados de cadastro</SubTitle>
            <p>
              Nome, e-mail, CPF e telefone, informados por você (ou pela empresa
              que convidou você) para criar e manter a conta. O CPF é exigido
              pelo provedor de pagamento para assinaturas recorrentes.
            </p>

            <SubTitle>b) Métricas de bem-estar (numéricas)</SubTitle>
            <p>
              Indicadores derivados do processamento local — como estimativas de
              postura (ombro, cabeça, rotação, coluna), tendência de humor e
              nível de energia, além de contadores de exercícios e pausas
              realizados. São <strong className="text-cloud">valores numéricos</strong>,
              não imagens, usados para gerar seus relatórios de evolução.
            </p>

            <SubTitle>c) Dados de conta e uso</SubTitle>
            <p>
              Informações de autenticação (feita por cookies de sessão), status
              da assinatura e registros técnicos mínimos necessários para
              operar, proteger e melhorar o serviço.
            </p>

            <SubTitle>d) Dados de pagamento</SubTitle>
            <p>
              O pagamento é processado pelo Mercado Pago. Não armazenamos os
              dados do seu cartão — eles são tratados diretamente pelo provedor
              de pagamento, sob a política de privacidade dele.
            </p>
          </Section>

          <Section title="5. Por que tratamos esses dados (finalidades)">
            <ul className="space-y-2">
              <Bullet>Criar e manter sua conta e autenticar o acesso.</Bullet>
              <Bullet>
                Gerar seus relatórios de bem-estar e a evolução ao longo do tempo.
              </Bullet>
              <Bullet>Processar assinaturas e pagamentos.</Bullet>
              <Bullet>
                No contexto empresarial, fornecer ao gestor indicadores
                <strong className="text-cloud"> agregados da equipe</strong> —
                nunca a leitura individual e sensível de uma pessoa específica.
              </Bullet>
              <Bullet>
                Enviar comunicações essenciais ao serviço (verificação de e-mail,
                confirmação de pagamento, avisos importantes).
              </Bullet>
              <Bullet>Garantir a segurança e prevenir fraudes e abusos.</Bullet>
            </ul>
          </Section>

          <Section title="6. Visão do gestor: sempre agregada">
            <p>
              Quando o StamFlow é usado por uma empresa, o painel de gestão
              mostra apenas dados <strong className="text-cloud">agregados do
              grupo</strong> — como energia média da equipe e distribuição geral
              de indicadores. O gestor não tem acesso à leitura individual e
              sensível de um colaborador específico. O objetivo é apoiar o
              cuidado coletivo preservando a privacidade de cada pessoa.
            </p>
          </Section>

          <Section title="7. Com quem compartilhamos">
            <p>
              Não vendemos seus dados. Compartilhamos o mínimo necessário com
              parceiros que viabilizam o serviço, como:
            </p>
            <ul className="mt-3 space-y-2">
              <Bullet>
                Provedor de pagamento (Mercado Pago), para processar assinaturas.
              </Bullet>
              <Bullet>
                Provedores de infraestrutura e envio de e-mail, para hospedar o
                serviço e enviar as comunicações essenciais.
              </Bullet>
              <Bullet>
                Autoridades, quando exigido por lei ou ordem judicial.
              </Bullet>
            </ul>
          </Section>

          <Section title="8. Por quanto tempo guardamos">
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa e pelo tempo
              necessário para cumprir as finalidades desta política ou
              obrigações legais. Encerrada a conta, os dados são eliminados ou
              anonimizados em prazo razoável, ressalvadas as hipóteses de guarda
              obrigatória previstas em lei.
            </p>
          </Section>

          <Section title="9. Seus direitos">
            <p>
              Nos termos da LGPD, você pode solicitar a qualquer momento:
              confirmação de tratamento, acesso, correção, anonimização,
              portabilidade, eliminação e informações sobre compartilhamento,
              além de revogar consentimentos. Para exercê-los, escreva para
              suporte@stamflow.com.br.
            </p>
          </Section>

          <Section title="10. Segurança">
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus
              dados, como autenticação por cookies de sessão, proteções contra
              requisições forjadas e restrição de acesso. Nenhum sistema é
              totalmente imune a riscos, mas trabalhamos continuamente para
              reduzi-los — e o fato de a imagem nunca sair do seu dispositivo é,
              por si só, uma proteção significativa.
            </p>
          </Section>

          <Section title="11. Menores de idade">
            <p>
              O StamFlow não é destinado a menores de 18 anos e não coletamos
              intencionalmente dados de crianças e adolescentes.
            </p>
          </Section>

          <Section title="12. Alterações nesta política">
            <p>
              Podemos atualizar esta política para refletir mudanças no serviço
              ou na legislação. Quando isso acontecer, revisaremos a data de
              &quot;última atualização&quot; no topo e, se a mudança for
              relevante, avisaremos pelos canais adequados.
            </p>
          </Section>

          <Section title="13. Contato">
            <p>
              Dúvidas sobre esta política ou sobre seus dados? Fale com o nosso
              encarregado (DPO) em suporte@stamflow.com.br.
            </p>
          </Section>
        </div>

      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-bold text-cloud sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slatey">{children}</div>
    </section>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-5 font-display text-base font-bold text-cloud">{children}</h3>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-raio" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
