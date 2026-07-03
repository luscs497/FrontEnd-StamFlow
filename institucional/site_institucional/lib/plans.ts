/**
 * Vitrine do plano individual (avulso).
 *
 * Modelo real do produto: existe UM plano individual, contratável em quatro
 * períodos (mensal, trimestral, semestral e anual) — cada período é um
 * registro próprio em GET /subscription_plan/plans (type=individual), com
 * preço total fechado (não é desconto percentual sobre o mensal).
 *
 * Os valores abaixo espelham os planos reais cadastrados no backend:
 *   Avulso Mensal      R$  29,90  (2990 centavos)
 *   Avulso Trimestral  R$  79,90  (7990)
 *   Avulso Semestral   R$ 149,90  (14990)
 *   Avulso Anual       R$ 269,90  (26990)
 *
 * A UI continua lendo desta fonte com estados de carregando/erro/sucesso;
 * para integrar de verdade basta trocar fetchAvulsoPlan() pela chamada real
 * ao endpoint e mapear a resposta.
 */

export type PeriodId = "mensal" | "trimestral" | "semestral" | "anual";

export interface Period {
  id: PeriodId;
  label: string;
  months: number;
  /** Preço total do período, em centavos (espelha price_in_cents do backend). */
  priceInCents: number;
}

export const PERIODS: Period[] = [
  { id: "mensal", label: "Mensal", months: 1, priceInCents: 2990 },
  { id: "trimestral", label: "Trimestral", months: 3, priceInCents: 7990 },
  { id: "semestral", label: "Semestral", months: 6, priceInCents: 14990 },
  { id: "anual", label: "Anual", months: 12, priceInCents: 26990 },
];

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  features: string[];
}

/**
 * O plano individual único do StamFlow. As features refletem o que o painel
 * avulso entrega hoje (leitura ao vivo, exercícios, Pausa Mental, Foco,
 * University, relatórios/insights, conquistas e suporte).
 */
const AVULSO_PLAN: Plan = {
  id: "avulso",
  name: "StamFlow Individual",
  tagline:
    "Acesso completo a tudo que o StamFlow oferece — do acompanhamento ao vivo aos relatórios de evolução.",
  features: [
    "Leitura de humor, postura e energia em tempo real pela webcam",
    "Processamento 100% no seu navegador — nenhuma imagem sai do seu dispositivo",
    "Exercícios guiados para pausas ativas ao longo do dia",
    "Pausa Mental: áudios de respiração e relaxamento",
    "Modo Foco: trilhas sonoras para concentração",
    "StamFlow University: conteúdo sobre ergonomia e bem-estar",
    "Relatórios com histórico e tendências da sua energia",
    "Sistema de conquistas para acompanhar sua evolução",
    "Suporte por chamados direto no painel",
  ],
};

/** Resultado do cálculo de preço para um período. */
export interface PriceBreakdown {
  /** Equivalente mensal (total do período dividido pelos meses). */
  perMonth: number;
  /** Total cobrado no período, em reais. */
  total: number;
  /** Economia percentual em relação a pagar o mensal cheio pelo mesmo tempo. */
  savingsPct: number;
}

const MONTHLY_BASE_CENTS = PERIODS[0].priceInCents;

export function priceFor(period: Period): PriceBreakdown {
  const total = period.priceInCents / 100;
  const perMonth = total / period.months;
  const fullPrice = (MONTHLY_BASE_CENTS * period.months) / 100;
  const savingsPct =
    period.months === 1 ? 0 : Math.round((1 - total / fullPrice) * 100);
  return { perMonth, total, savingsPct };
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Simula GET /subscription_plan/plans?type=individual (consolidado no plano
 * único). Resolve depois de um pequeno atraso para a UI exercitar o estado
 * "carregando". Para demonstrar o estado de ERRO, troque SIMULATE_ERROR.
 */
const SIMULATE_ERROR = false;

export function fetchAvulsoPlan(): Promise<Plan> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (SIMULATE_ERROR) {
        reject(new Error("Não foi possível carregar o plano agora."));
        return;
      }
      resolve(AVULSO_PLAN);
    }, 900);
  });
}
