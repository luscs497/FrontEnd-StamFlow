/**
 * Constantes do site. Os endpoints já existem em produção, mas NESTA fase
 * tudo é mockado (ver lib/plans.ts e os formulários). Os pontos de integração
 * estão centralizados aqui para a virada futura ser trivial.
 */

// App de login já existente (fora deste projeto). "Entrar" aponta pra cá.
export const LOGIN_URL = "https://login.stamflow.com.br";

// Logo oficial (ícone quadrado do produto).
export const ICON_URL = "https://login.stamflow.com.br/icon.png";

// Base da API (todos os endpoints abaixo já estão em produção).
export const API_BASE = "https://api.stamflow.com.br";

export const ENDPOINTS = {
  register: `${API_BASE}/auth/register`, // POST {nome, email, senha}
  trialStart: `${API_BASE}/subscription/trial/start`, // POST (após register)
  plans: `${API_BASE}/subscription_plan/plans`, // GET ?type=individual
  enterpriseRequest: `${API_BASE}/enterprise/request`, // POST -> devolve link wa.me
} as const;

// Número usado para montar o link wa.me do fluxo empresarial.
// Formato: DDI+DDD+numero, só dígitos.
export const SALES_WHATSAPP = "558482002100";

// Duração do teste grátis.
export const TRIAL_DAYS = 7;

// Âncoras de navegação. Absolutas a partir da raiz para funcionarem de
// qualquer página (ex.: a partir de /empresas). A ordem e os rótulos seguem
// o documento de copy da LP B2C; "Para empresas" vive nos botões do header,
// ao lado de "Entrar" e "Escolher meu Plano".
export const NAV = [
  { label: "Inovação Global", href: "/#inovacao" },
  { label: "Procrastinação", href: "/#procrastinacao" },
  { label: "Como Funciona", href: "/#como-funciona" },
  { label: "Recursos", href: "/#recursos" },
  { label: "Planos", href: "/#planos" },
  { label: "Segurança", href: "/#privacidade" },
  { label: "Dúvidas", href: "/#duvidas" },
] as const;

// Navegação da LP corporativa (/empresas), com âncoras próprias da página,
// seguindo o documento de copy da LP B2B.
export const NAV_EMPRESAS = [
  { label: "Inovação Global", href: "/empresas/#inovacao" },
  { label: "PGR: NR1, NR28", href: "/empresas/#pgr" },
  { label: "Crise no RH", href: "/empresas/#crise" },
  { label: "StamFlow B2B", href: "/empresas/#stamflow-b2b" },
  { label: "ROI & Compliance", href: "/empresas/#roi" },
  { label: "Planos Corporativos", href: "/empresas/#planos-corporativos" },
  { label: "Dúvidas", href: "/empresas/#duvidas" },
  { label: "Segurança", href: "/empresas/#seguranca" },
] as const;
