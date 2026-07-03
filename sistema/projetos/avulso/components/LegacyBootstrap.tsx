"use client";

import { useEffect } from "react";
import { LEGACY_SCRIPTS } from "@/lib/scripts";

declare global {
  interface Window {
    __stamflowBooted?: boolean;
  }
}

// ---------------------------------------------------------------------------
// Configuração de autenticação / autorização
// ---------------------------------------------------------------------------
const API_BASE = "https://api.stamflow.com.br";
const LOGIN_URL = "https://login.stamflow.com.br/";
// Destinos para quem não tem acesso liberado ao painel. A demo foi desativada
// no fluxo (o backend segue pronto para religá-la no futuro).
//   /sem_assinatura      -> nunca teve assinatura (ou checkout incompleto)
//   /assinatura_expirada -> teve e expirou/cancelou; ?perfil ajusta a mensagem
const SEM_ASSINATURA_URL = "https://stamflow.com.br/sem_assinatura";
const EXPIRADA_URL = "https://stamflow.com.br/assinatura_expirada";

// Classifica o acesso a partir do /account/profile.
// Retorna: "ok" (libera painel) | "sem" (nunca teve) | "expirada" (teve e perdeu).
// perfil ("avulso" | "colaborador" | "empresa") define a mensagem da página
// de expirada.
function classificarAcesso(
  assinatura: { status?: string; expira_em?: string | null } | null | undefined
): "ok" | "sem" | "expirada" {
  if (!assinatura || !assinatura.status) return "sem";

  const status = assinatura.status;
  const vencida =
    !!assinatura.expira_em && new Date(assinatura.expira_em).getTime() < Date.now();

  if ((status === "ACTIVE" || status === "TRIALING") && !vencida) return "ok";
  if (status === "INCOMPLETE") return "sem";
  return "expirada";
}

// Qual painel é ESTE build. Cada painel é um deploy separado.
//   "avulso"    -> painel.stamflow.com.br      (client SEM empresa)
//   "empregado" -> user.stamflow.com.br        (client COM empresa)
//   "gestor"    -> gestor.stamflow.com.br      (manager)
const THIS_PANEL = "avulso";

const PANEL_URLS: Record<string, string> = {
  avulso: "https://painel.stamflow.com.br/",
  empregado: "https://user.stamflow.com.br/",
  gestor: "https://gestor.stamflow.com.br/",
};

function hardRedirect(url: string) {
  // replace() não deixa a página atual no histórico (não dá pra "voltar")
  window.location.replace(url);
}

/**
 * Gate de autenticação + autorização.
 * Roda ANTES de qualquer script legado (a câmera só inicia se autorizado).
 * Retorna true somente se o usuário tem sessão válida E pertence a ESTE painel.
 */
async function verifySession(): Promise<boolean> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
  } catch {
    // Falha de rede / CORS / offline -> trata como não autenticado
    hardRedirect(LOGIN_URL);
    return false;
  }

  // 401 -> tenta um refresh; se falhar, vai pro login
  if (res.status === 401) {
    try {
      const r = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) {
        hardRedirect(LOGIN_URL);
        return false;
      }
      res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    } catch {
      hardRedirect(LOGIN_URL);
      return false;
    }
  }

  if (!res.ok) {
    hardRedirect(LOGIN_URL);
    return false;
  }

  // Sessão válida -> verifica se o usuário pertence a ESTE painel
  let user: { tipo?: string; company_id?: number | null };
  try {
    user = await res.json();
  } catch {
    hardRedirect(LOGIN_URL);
    return false;
  }

  const tipo = user.tipo;
  const companyId = user.company_id ?? null;

  let allowedPanel: string | null;
  if (tipo === "manager") {
    allowedPanel = "gestor";
  } else if (tipo === "client") {
    if (companyId != null) {
      allowedPanel = "empregado";
    } else {
      // Client sem empresa: busca o profile e classifica o acesso.
      // ok -> painel avulso | sem -> /sem_assinatura | expirada -> /assinatura_expirada
      let assinatura: { status?: string; expira_em?: string | null } | null = null;
      try {
        const profileRes = await fetch(`${API_BASE}/account/profile`, {
          credentials: "include",
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          assinatura = profile?.assinatura ?? null;
        }
      } catch {
        // Falha secundária: por segurança, trata como sem assinatura.
      }
      const acesso = classificarAcesso(assinatura);
      if (acesso === "expirada") {
        hardRedirect(`${EXPIRADA_URL}?perfil=avulso`);
        return false;
      }
      if (acesso === "sem") {
        hardRedirect(SEM_ASSINATURA_URL);
        return false;
      }
      allowedPanel = "avulso";
    }
  } else {
    // "company" ou tipo desconhecido não têm painel próprio
    allowedPanel = null;
  }

  if (allowedPanel === null) {
    hardRedirect(LOGIN_URL);
    return false;
  }

  if (allowedPanel !== THIS_PANEL) {
    // Token válido, mas painel errado -> manda pro painel correto
    hardRedirect(PANEL_URLS[allowedPanel]);
    return false;
  }

  return true;
}

/**
 * LegacyBootstrap
 * ---------------
 * 1) AUTH GATE: valida sessão + autorização ANTES de carregar qualquer script.
 *    Se não autorizado, redireciona e NUNCA carrega camera.js (câmera não liga).
 * 2) Só depois de autorizado, carrega os scripts legados em ordem e dispara
 *    os eventos de ciclo de vida que eles escutam.
 */
export default function LegacyBootstrap() {
  useEffect(() => {
    if (window.__stamflowBooted) return;
    window.__stamflowBooted = true;

    let cancelled = false;

    const loadScript = (src: string) =>
      new Promise<void>((resolve) => {
        if (document.querySelector(`script[data-legacy="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.async = false; // preserva a ordem de execução
        s.defer = false;
        s.dataset.legacy = src;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.body.appendChild(s);
      });

    (async () => {
      // 1) GATE — bloqueia tudo até confirmar sessão válida para ESTE painel
      const authorized = await verifySession();
      if (!authorized || cancelled) return; // redirecionando: não inicia o app

      // 2) Autorizado — remove o overlay e carrega os scripts legados
      const overlay = document.getElementById("auth-overlay");
      if (overlay) overlay.remove();

      for (const src of LEGACY_SCRIPTS) {
        if (cancelled) return;
        await loadScript(src);
      }
      if (cancelled) return;

      document.dispatchEvent(
        new Event("DOMContentLoaded", { bubbles: true, cancelable: true })
      );
      window.dispatchEvent(new Event("load"));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
