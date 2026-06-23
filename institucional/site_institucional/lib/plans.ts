/**
 * Vitrine de planos individuais (avulso).
 *
 * Os preços/nomes abaixo são PROVISÓRIOS e simulam o que virá de
 * GET /subscription_plan/plans?type=individual. Por isso nada é "hardcoded"
 * no layout: a UI lê desta fonte e suporta carregando / erro / sucesso, além de
 * preços e nomes variáveis. Para integrar de verdade, basta trocar fetchIndividualPlans()
 * por uma chamada real ao endpoint e mapear a resposta para o tipo Plan.
 */

export type PeriodId = "mensal" | "trimestral" | "semestral" | "anual";

export interface Period {
  id: PeriodId;
  label: string;
  months: number;
  /** Desconto aplicado sobre o preço mensal cheio (0 = sem desconto). */
  discount: number;
}

export const PERIODS: Period[] = [
  { id: "mensal", label: "Mensal", months: 1, discount: 0 },
  { id: "trimestral", label: "Trimestral", months: 3, discount: 0.05 },
  { id: "semestral", label: "Semestral", months: 6, discount: 0.1 },
  { id: "anual", label: "Anual", months: 12, discount: 0.2 },
];

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  /** Preço mensal cheio, em reais (base para o cálculo por período). */
  basePrice: number;
  features: string[];
  highlight?: boolean;
}

const MOCK_PLANS: Plan[] = [
  {
    id: "essencial",
    name: "Essencial",
    tagline: "Para começar a enxergar a sua energia ao longo do dia.",
    basePrice: 19,
    features: [
      "Leitura de postura (ombros, cabeça, coluna, rotação) e humor",
      "Índice de energia ao vivo",
      "Pausa Mental e exercícios guiados",
      "Processamento 100% no seu navegador",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para quem leva o próprio ritmo a sério.",
    basePrice: 39,
    highlight: true,
    features: [
      "Tudo do Essencial",
      "Histórico e tendências de energia",
      "Biblioteca completa de exercícios, Foco e StamFlow University",
      "Metas e lembretes inteligentes",
      "Suporte prioritário",
    ],
  },
];

/** Resultado do cálculo de preço para um período. */
export interface PriceBreakdown {
  perMonth: number;
  total: number;
  savingsPct: number;
}

export function priceFor(plan: Plan, period: Period): PriceBreakdown {
  const perMonth = plan.basePrice * (1 - period.discount);
  return {
    perMonth,
    total: perMonth * period.months,
    savingsPct: Math.round(period.discount * 100),
  };
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
 * Simula GET /subscription_plan/plans?type=individual.
 * Resolve depois de um pequeno atraso para a UI exercitar o estado "carregando".
 *
 * Para demonstrar o estado de ERRO no layout, troque `SIMULATE_ERROR` para true.
 */
const SIMULATE_ERROR = false;

export function fetchIndividualPlans(): Promise<Plan[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (SIMULATE_ERROR) {
        reject(new Error("Não foi possível carregar os planos agora."));
        return;
      }
      resolve(MOCK_PLANS);
    }, 900);
  });
}
