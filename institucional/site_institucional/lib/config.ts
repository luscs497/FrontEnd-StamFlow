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

// Âncoras de navegação interna.
export const NAV = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Privacidade", href: "#privacidade" },
  { label: "Para empresas", href: "#empresas" },
  { label: "Planos", href: "#planos" },
  { label: "Dúvidas", href: "#duvidas" },
] as const;
