/* auth.js - Camada de autenticação centralizada (Refresh Token automático + CSRF) */

(function () {
  "use strict";

  const API = "https://api.stamflow.com.br";
  let _refreshing = null;

  // ==========================================================================
  // CSRF — double-submit cookie pattern (CORREÇÃO C3)
  // getCookie lê o cookie csrf_token (não-httponly) para injetar como header
  // X-CSRF-Token em toda requisição de mutação para a API.
  // ==========================================================================
  function getCookie(name) {
    const match = document.cookie.match(
      new RegExp("(?:^|;\\s*)" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  const MUTATING = ["POST", "PUT", "PATCH", "DELETE"];

  function injectCsrf(options) {
    options = options || {};
    const method = ((options.method || "GET") + "").toUpperCase();
    if (!MUTATING.includes(method)) return options;
    const token = getCookie("csrf_token");
    if (!token) return options;
    options.headers = Object.assign({ "X-CSRF-Token": token }, options.headers || {});
    return options;
  }

  // ==========================================================================
  // MONKEY-PATCH do fetch global
  // Intercepta QUALQUER fetch para api.stamflow.com.br e:
  //   1. Garante credentials: "include"
  //   2. Injeta X-CSRF-Token em métodos de mutação
  // Isso cobre camera.js, get-repots.js, notifications.js e qualquer script
  // futuro — sem precisar alterar cada um individualmente.
  // ==========================================================================
  const _nativeFetch = window.fetch.bind(window);

  window.fetch = function patchedFetch(input, init) {
    const url = typeof input === "string" ? input : (input instanceof URL ? input.href : (input.url || ""));
    if (url.startsWith(API)) {
      init = Object.assign({ credentials: "include" }, init || {});
      init = injectCsrf(init);
    }
    return _nativeFetch(input, init);
  };

  // ==========================================================================
  // tryRefresh — renova o access token via cookie
  // ==========================================================================
  async function tryRefresh() {
    try {
      // Usa o fetch nativo para evitar loop infinito (refresh não precisa de CSRF)
      const res = await _nativeFetch(`${API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // window.authFetch — wrapper com refresh automático
  // Mantido para compatibilidade com scripts que chamam window.authFetch
  // explicitamente. Com o monkey-patch acima, o CSRF e credentials já são
  // injetados automaticamente — authFetch agora só adiciona o retry de 401.
  // ==========================================================================
  window.authFetch = async function authFetch(url, options) {
    // O fetch patchado já injeta credentials e CSRF
    let res = await window.fetch(url, options);

    if (res.status === 401) {
      if (!_refreshing) {
        _refreshing = tryRefresh().finally(() => { _refreshing = null; });
      }
      const ok = await _refreshing;
      if (ok) {
        res = await window.fetch(url, options);
      } else {
        window.location.href = "https://login.stamflow.com.br/";
      }
    }

    return res;
  };

})();
