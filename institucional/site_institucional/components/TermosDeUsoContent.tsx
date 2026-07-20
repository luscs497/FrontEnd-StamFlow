"use client";

/**
 * ⚠️ VERSÃO PROVISÓRIA — NÃO É ACONSELHAMENTO JURÍDICO.
 *
 * Rascunho de boa-fé, baseado no funcionamento atual do StamFlow. DEVE ser
 * revisado por um advogado antes de ser considerado oficial.
 *
 */

import { motion } from "framer-motion";

const UPDATED_AT = "julho de 2026";

export function TermosDeUsoContent() {
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
          <p className="eyebrow"><span className="eyebrow-tick" /> Termos de Uso</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-cloud sm:text-5xl">
            As regras do <span className="text-raio">bom uso</span>.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slatey">
            Estes Termos de Uso definem as condições para você usar o StamFlow.
            Ao criar uma conta ou usar o serviço, você concorda com eles. Leia
            com atenção — escrevemos de forma direta, sem juridiquês
            desnecessário.
          </p>
          <p className="mt-3 text-sm text-muted">Última atualização: {UPDATED_AT}.</p>
        </motion.div>

        <div className="mt-12 space-y-10">
          <Section title="1. Quem somos e o que é o StamFlow">
            <p>
              O StamFlow é um serviço operado por STAMFLOW SERVIÇOS EM INFORMÁTICA LTDA, CNPJ 67.806.396/0001-30,
              com sede em Av. Engenheiro Roberto Freire, nº 1962, Loja 13, Cond. Seaway Shopping, Capim Macio, Natal - RN, CEP 59.082-095. O StamFlow lê postura, humor e energia pela
              câmera — com o processamento acontecendo inteiramente no seu
              navegador — e oferece exercícios, pausas, foco e relatórios de
              acompanhamento, tanto para uso individual quanto para equipes.
            </p>
          </Section>

          <Section title="2. Aceitação dos termos">
            <p>
              Ao criar uma conta, assinar um plano ou usar qualquer parte do
              serviço, você declara que leu, entendeu e concorda com estes
              Termos e com a nossa{" "}
              <a href="/politica-de-privacidade/" className="text-raio hover:underline">
                Política de Privacidade
              </a>
              . Se você não concordar, não use o StamFlow.
            </p>
          </Section>

          <Section title="3. Conta e elegibilidade">
            <ul className="space-y-2">
              <Bullet>
                Você precisa ter pelo menos 18 anos para criar uma conta.
              </Bullet>
              <Bullet>
                As informações de cadastro devem ser verdadeiras, corretas e
                atualizadas.
              </Bullet>
              <Bullet>
                Você é responsável por manter a senha em sigilo e por toda
                atividade realizada na sua conta.
              </Bullet>
              <Bullet>
                Contas criadas por uma empresa para seus colaboradores seguem
                também as regras acordadas entre você e essa empresa.
              </Bullet>
            </ul>
          </Section>

          <Section title="4. Assinaturas, preços e pagamento">
            <ul className="space-y-2">
              <Bullet>
                O acesso ao StamFlow é por assinatura, disponível em períodos
                mensal, trimestral e anual. O preço vigente é o
                exibido no momento da contratação.
              </Bullet>
              <Bullet>
                O pagamento é processado pelo Mercado Pago. A assinatura é
                <strong className="text-cloud"> recorrente</strong>: é renovada
                e cobrada automaticamente ao fim de cada período, até que você
                cancele.
              </Bullet>
              <Bullet>
                Não armazenamos os dados do seu cartão — eles são tratados
                diretamente pelo provedor de pagamento.
              </Bullet>
              <Bullet>
                Podemos alterar preços no futuro. Mudanças de preço não afetam o
                período já pago e serão comunicadas antes de valerem para a
                renovação seguinte.
              </Bullet>
            </ul>
          </Section>

          <Section title="5. Cancelamento e reembolso">
            <ul className="space-y-2">
              <Bullet>
                Você pode cancelar a qualquer momento. O cancelamento interrompe
                as cobranças futuras; o acesso permanece ativo até o fim do
                período já pago.
              </Bullet>
              <Bullet>
                Reembolsos, quando aplicáveis, seguem a legislação de defesa do
                consumidor — incluindo o direito de arrependimento em até 7 dias
                da contratação, quando cabível.
              </Bullet>
              <Bullet>
                Podemos suspender ou encerrar contas que violem estes Termos,
                sem prejuízo das medidas legais cabíveis.
              </Bullet>
            </ul>
          </Section>

          <Section title="6. Uso aceitável">
            <p>Ao usar o StamFlow, você concorda em não:</p>
            <ul className="mt-3 space-y-2">
              <Bullet>
                Usar o serviço para fins ilícitos ou de forma que viole direitos
                de terceiros.
              </Bullet>
              <Bullet>
                Compartilhar sua conta, credenciais ou licença com pessoas não
                autorizadas.
              </Bullet>
              <Bullet>
                Tentar copiar, descompilar, aplicar engenharia reversa, revender
                ou explorar comercialmente o serviço sem autorização.
              </Bullet>
              <Bullet>
                Interferir na segurança ou no funcionamento do serviço, acessar
                áreas restritas ou burlar limites técnicos.
              </Bullet>
              <Bullet>
                Usar meios automatizados (bots, scrapers) para acessar o serviço
                sem nossa autorização.
              </Bullet>
            </ul>
          </Section>

          <Section title="7. Uso por empresas e dados agregados">
            <p>
              Quando o StamFlow é contratado por uma empresa, o painel de gestão
              exibe apenas indicadores <strong className="text-cloud">agregados
              do grupo</strong> — nunca a leitura individual e sensível de um
              colaborador específico. A empresa é responsável por usar esses
              dados de forma adequada e por informar seus colaboradores conforme
              a legislação aplicável.
            </p>
          </Section>

          <Section title="8. Natureza do serviço — não é aconselhamento médico">
            <p>
              O StamFlow é uma ferramenta de apoio ao bem-estar e à
              produtividade. Ele <strong className="text-cloud">não é um
              dispositivo médico</strong> e não substitui diagnóstico,
              tratamento ou aconselhamento de profissionais de saúde. As
              leituras e indicadores são estimativas para autoconhecimento, não
              medições clínicas.
            </p>
            <p>
              No contexto empresarial, o StamFlow é um instrumento de apoio e não
              substitui o cumprimento de obrigações legais da empresa (como PGR,
              laudos técnicos e atuação do SESMT/medicina do trabalho).
            </p>
          </Section>

          <Section title="9. Propriedade intelectual">
            <p>
              O StamFlow, sua marca, logotipo, software, textos e demais
              elementos são de titularidade de STAMFLOW SERVIÇOS EM INFORMÁTICA LTDA ou de seus
              licenciadores, protegidos por lei. A assinatura concede a você uma
              licença limitada, pessoal e intransferível para usar o serviço —
              não transfere nenhuma propriedade.
            </p>
          </Section>

          <Section title="10. Disponibilidade e alterações do serviço">
            <p>
              Trabalhamos para manter o serviço disponível e funcional, mas ele é
              fornecido &quot;como está&quot;. Podemos atualizar, adicionar ou
              remover funcionalidades, e realizar manutenções que
              eventualmente causem indisponibilidade temporária.
            </p>
          </Section>

          <Section title="11. Limitação de responsabilidade">
            <p>
              Na máxima extensão permitida pela lei, o StamFlow não se
              responsabiliza por danos indiretos, lucros cessantes ou perdas
              decorrentes de uso, indisponibilidade ou de decisões tomadas com
              base nos indicadores do serviço. Nada nestes Termos exclui
              responsabilidades que não possam ser afastadas por lei.
            </p>
          </Section>

          <Section title="12. Alterações destes Termos">
            <p>
              Podemos atualizar estes Termos para refletir mudanças no serviço ou
              na legislação. Revisaremos a data no topo e, se a mudança for
              relevante, avisaremos pelos canais adequados. O uso continuado após
              a atualização significa concordância com a nova versão.
            </p>
          </Section>

          <Section title="13. Lei aplicável e foro">
            <p>
              Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro
              da comarca de Natal - RN para dirimir eventuais controvérsias,
              salvo disposição legal em contrário aplicável ao consumidor.
            </p>
          </Section>

          <Section title="14. Contato">
            <p>
              Dúvidas sobre estes Termos? Fale com a gente em suporte@stamflow.com.br.
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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-raio" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
