"use client";

import { useEffect } from "react";

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

const SCRIPTS = [
  "/scripts/script.js",
  "/scripts/tickets.js",
  "/scripts/manager-dashboard.js",
  "/scripts/collaborators.js",
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
    allowedPanel = "gestor";
  } else if (tipo === "client") {
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
      s.src = src;
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
