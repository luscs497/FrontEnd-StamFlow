/* auth.js - Camada de autenticação centralizada (Refresh Token automático) */
/* MODO TESTE: redirects para login desabilitados — acesso liberado sem cookie. */

(function () {
  "use strict";

  const API = "https://api.stamflow.com.br";
  let _refreshing = null; // promise única para evitar race condition

  /**
   * Tenta renovar o access token via /auth/refresh.
   * Retorna true se conseguiu, false se a sessão expirou de vez.
   */
  async function tryRefresh() {
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Wrapper de fetch com refresh automático:
   * - Faz a requisição normalmente.
   * - Se receber 401, tenta refresh uma vez e repete.
   * - Se o refresh falhar, redireciona para o login.
   */
  window.authFetch = async function authFetch(url, options = {}) {
    options.credentials = "include"; // sempre envia cookies

    let res = await fetch(url, options);

    if (res.status === 401) {
      // Garante que apenas um refresh acontece por vez
      if (!_refreshing) {
        _refreshing = tryRefresh().finally(() => { _refreshing = null; });
      }
      const ok = await _refreshing;

      if (ok) {
        // Repete a requisição original com os novos cookies
        res = await fetch(url, options);
      } else {
        // Sessão inválida: redireciona para o login.
        window.location.href = "https://login.stamflow.com.br/";
      }
    }

    return res;
  };
})();
