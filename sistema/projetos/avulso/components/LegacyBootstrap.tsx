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
    allowedPanel = companyId != null ? "empregado" : "avulso";
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
