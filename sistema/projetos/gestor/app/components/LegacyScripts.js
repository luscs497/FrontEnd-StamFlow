"use client";

import { useEffect } from "react";

import { comVersao } from "../assetVersion";

/*
  LegacyScripts (com gate de autenticação/autorização)

  1) GATE: antes de carregar QUALQUER script, valida a sessão via /auth/me.
     - Sem sessão válida -> redireciona para o login.
     - Sessão válida mas painel errado -> redireciona para o painel correto.
     - Só carrega os scripts do painel do gestor se o usuário for "manager".

  2) Depois de autorizado, carrega os scripts vanilla na ordem original e
     dispara o evento "painelGestorReady" que os scripts escutam.
*/

const API_BASE = "https://api.stamflow.com.br";
const LOGIN_URL = "https://login.stamflow.com.br/";
const THIS_PANEL = "gestor";

const PANEL_URLS = {
  avulso: "https://painel.stamflow.com.br/",
  empregado: "https://user.stamflow.com.br/",
  gestor: "https://gestor.stamflow.com.br/",
};

// Destinos para quem não tem acesso liberado. A demo foi desativada no fluxo
// (o backend segue pronto para religá-la no futuro).
const SEM_ASSINATURA_URL = "https://stamflow.com.br/sem_assinatura";
const EXPIRADA_URL = "https://stamflow.com.br/assinatura_expirada";

// Classifica o acesso a partir do /account/profile.
// "ok" (libera) | "sem" (nunca teve) | "expirada" (teve e perdeu).
function classificarAcesso(assinatura) {
  if (!assinatura || !assinatura.status) return "sem";
  const status = assinatura.status;
  const vencida =
    !!assinatura.expira_em && new Date(assinatura.expira_em).getTime() < Date.now();
  if ((status === "ACTIVE" || status === "TRIALING") && !vencida) return "ok";
  if (status === "INCOMPLETE") return "sem";
  return "expirada";
}

async function fetchAssinatura() {
  try {
    const res = await fetch(`${API_BASE}/account/profile`, { credentials: "include" });
    if (res.ok) {
      const profile = await res.json();
      return profile && profile.assinatura ? profile.assinatura : null;
    }
  } catch {
    // trata como sem assinatura
  }
  return null;
}

const SCRIPTS = [
  "/scripts/script.js",
  "/scripts/tickets.js",
  "/scripts/manager-dashboard.js",
  "/scripts/collaborators.js",
  "/scripts/compliance.js",
  "/scripts/faq.js",
];

function hardRedirect(url) {
  window.location.replace(url);
}

async function verifySession() {
  let res;
  try {
    res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
  } catch {
    hardRedirect(LOGIN_URL);
    return false;
  }

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

  let user;
  try {
    user = await res.json();
  } catch {
    hardRedirect(LOGIN_URL);
    return false;
  }

  const tipo = user.tipo;
  const companyId = user.company_id ?? null;

  let allowedPanel;
  if (tipo === "manager") {
    // Gestor é o dono deste painel. Classifica a expiração aqui: se o plano
    // da empresa venceu/cancelou, vai para /assinatura_expirada?perfil=empresa
    // (mensagem "renove o plano da sua empresa"). Se nunca teve, também tratamos
    // como caso de contratar/renovar empresarial.
    const acesso = classificarAcesso(await fetchAssinatura());
    if (acesso === "expirada") {
      hardRedirect(`${EXPIRADA_URL}?perfil=empresa`);
      return false;
    }
    if (acesso === "sem") {
      hardRedirect(SEM_ASSINATURA_URL);
      return false;
    }
    allowedPanel = "gestor";
  } else if (tipo === "client") {
    // Nenhum tipo de client é dono deste painel: apenas encaminha para o
    // painel correto, que fará a classificação de acesso.
    allowedPanel = companyId != null ? "empregado" : "avulso";
  } else {
    allowedPanel = null; // company / desconhecido
  }

  if (allowedPanel === null) {
    hardRedirect(LOGIN_URL);
    return false;
  }

  if (allowedPanel !== THIS_PANEL) {
    hardRedirect(PANEL_URLS[allowedPanel]);
    return false;
  }

  return true;
}

export default function LegacyScripts() {
  useEffect(() => {
    if (window.__painelGestorScriptsLoaded) return;
    window.__painelGestorScriptsLoaded = true;

    let cancelled = false;

    function loadSequential(index) {
      if (cancelled || index >= SCRIPTS.length) {
        if (!cancelled) {
          document.dispatchEvent(new CustomEvent("painelGestorReady"));
        }
        return;
      }
      const src = SCRIPTS[index];
      const s = document.createElement("script");
      s.src = comVersao(src);
      s.async = false;
      s.dataset.legacy = "true";
      s.onload = () => loadSequential(index + 1);
      s.onerror = () => loadSequential(index + 1);
      document.body.appendChild(s);
    }

    (async () => {
      // 1) GATE — valida sessão + autorização antes de carregar os scripts
      const authorized = await verifySession();
      if (!authorized || cancelled) return;

      // 2) Autorizado — remove overlay e carrega os scripts
      const overlay = document.getElementById("auth-overlay");
      if (overlay) overlay.remove();

      loadSequential(0);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
