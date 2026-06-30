/* script.js - Lógica Global do Gestor (Cookies Version) */

// ============================================================================
// AUTH FETCH + CSRF (CORRECAO C3) - monkey-patch do fetch global.
// Carregado como IIFE independente ANTES do codigo de UI, sem alterar a
// estrutura original. Patcha window.fetch para injetar credentials e
// X-CSRF-Token em toda chamada de mutacao para a API.
// ============================================================================
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



(function() {
  async function _init() {
  
  // ============================================================================
  // 0) Autenticação/autorização já validada pelo LegacyScripts (gate roda antes).
  //    Aqui só garantimos a remoção do overlay.
  // ============================================================================
  const authOverlay = document.getElementById("auth-overlay");
  if (authOverlay) authOverlay.remove();

  // ============================================================================
  // 1) Helpers
  // ============================================================================
  const isMobile = () => window.innerWidth <= 500;

  function clickOutside(targetEl, callback) {
    function handler(ev) {
      if (!targetEl) return;
      if (!targetEl.contains(ev.target)) callback?.();
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }

  // ============================================================================
  // 2) Navegação (Tabs) + Header Mobile
  // ============================================================================
  const allListItems = document.querySelectorAll(".link-nav");
  const tituloSection = document.getElementById("section-name");
  const contents = document.querySelectorAll(".conteudo-site");

  const header = document.querySelector("header");
  const abrirHeader = document.querySelector(".abrir-header");

  allListItems.forEach((el) => {
    el.addEventListener("click", () => {
      const title = el.getAttribute("title");
      if (tituloSection) tituloSection.textContent = title;
    });
  });

  if (allListItems.length > 0) {
    allListItems.forEach((el) => el.classList.remove("ativo"));
    contents.forEach((el) => el.classList.add("display-none"));

    allListItems[0].classList.add("ativo");
    if (contents[0]) contents[0].classList.remove("display-none");
  }

  allListItems.forEach((el, index) => {
    el.addEventListener("click", () => {
      allListItems.forEach((item) => item.classList.remove("ativo"));
      el.classList.add("ativo");

      if (contents[index]) {
        contents.forEach((content) => content.classList.add("display-none"));
        contents[index].classList.remove("display-none");
      }

      if (abrirHeader && header) {
        abrirHeader.classList.remove("ativo");
        header.classList.remove("clicado");
      }

      sincronizarDestaquePai();
    });
  });

  if (abrirHeader && header) {
    abrirHeader.addEventListener("click", () => {
      abrirHeader.classList.toggle("ativo");
      header.classList.toggle("clicado");
    });
  }

  // Submenu "Reports" (Gestão de Reports / Treinamento Compliance / FAQ): o
  // cabeçalho (.tem-sub-lista-selector) só expande/colapsa a lista de
  // filhos — a navegação real acontece nos próprios filhos (.li-subitem).
  const subListaSelectors = document.querySelectorAll(".tem-sub-lista-selector");

  function getSubListaPai(selector) {
    return selector.closest(".tem-sub-lista")?.querySelector(".sub-lista") || null;
  }

  subListaSelectors.forEach((selector) => {
    selector.addEventListener("click", () => {
      const subLista = getSubListaPai(selector);
      if (subLista) subLista.classList.toggle("display-none");
    });
  });

  // Mantém o cabeçalho "Reports" destacado (cor ativa + seta para cima)
  // sempre que um dos filhos (Gestão de Reports / Treinamento Compliance /
  // FAQ) estiver selecionado — sem isso, o usuário perde a referência de
  // onde está ao navegar dentro do submenu.
  function sincronizarDestaquePai() {
    subListaSelectors.forEach((selector) => {
      const subLista = getSubListaPai(selector);
      if (!subLista) return;
      const temFilhoAtivo = subLista.querySelector(".li-subitem.ativo") !== null;
      selector.classList.toggle("ativo", temFilhoAtivo);
      if (temFilhoAtivo) {
        // Mantém o submenu aberto enquanto um dos filhos estiver ativo.
        subLista.classList.remove("display-none");
      } else {
        // Fecha ao navegar para fora do submenu, para não deixá-lo aberto
        // sem nenhum item correspondente selecionado.
        subLista.classList.add("display-none");
      }
    });
  }

  sincronizarDestaquePai();

  // ============================================================================
  // 3) Dropdown de Períodos (Painel Principal) — REMOVIDO.
  //    Os chips Hoje/Essa Semana/Esse Mês (e o dropdown suspenso que
  //    aparecia no mobile) foram substituídos por um seletor de data
  //    início/fim real (.selecao-data-range), no mesmo padrão já usado na
  //    aba Comparar. A lógica de fetch/preenchimento desses inputs vive em
  //    manager-dashboard.js, que escuta o evento "change" deles.
  // ============================================================================

  // ============================================================================
  // 4) Alternância e Dropdowns Comparação
  // ============================================================================
  const compararBtn = document.getElementById("comparar");
  const cancelarBtn = document.getElementById("cancelar");
  const divsGestor = document.querySelectorAll(".painel-gestor");

  if (divsGestor.length > 1 && compararBtn && cancelarBtn) {
    divsGestor[1].classList.add("display-none");

    compararBtn.addEventListener("click", () => {
      divsGestor[0].classList.add("display-none");
      divsGestor[1].classList.remove("display-none");
    });

    cancelarBtn.addEventListener("click", () => {
      divsGestor[0].classList.remove("display-none");
      divsGestor[1].classList.add("display-none");
    });
  }

  // Os seletores de período A/B da aba Comparar agora são inputs de data
  // reais (input[type="date"]); a lógica de fetch/preenchimento deles vive
  // em manager-dashboard.js, que já escuta o evento "change" desses campos.

  const fecharReport = document.getElementById("fechar-report");
  const reportDiv = document.querySelector(".pop-ups");

  if (fecharReport && reportDiv) {
    fecharReport.addEventListener("click", () => {
      reportDiv.classList.add("display-none");
    });
  }

  const statusSeletores = document.querySelectorAll(".status-opcao");

  function removerAtivoStatus() {
    statusSeletores.forEach((el) => {
      el.className = "status-opcao";
    });
  }

  statusSeletores.forEach((el, index) => {
    el.addEventListener("click", () => {
      removerAtivoStatus();
      if (index === 0) el.classList.add("concluido");
      if (index === 1) el.classList.add("andamento");
      if (index === 2) el.classList.add("aberto");
    });
  });

  // Seletor de tag/categoria do Report (mesmo padrão do seletor de status).
  // Aqui o nome da classe visual é igual ao valor do atributo "tag", então
  // não precisa de tradução de índice como no status.
  const tagSeletores = document.querySelectorAll(".tag-opcao");

  function removerAtivoTag() {
    tagSeletores.forEach((el) => {
      el.className = "tag-opcao";
    });
  }

  tagSeletores.forEach((el) => {
    el.addEventListener("click", () => {
      removerAtivoTag();
      el.classList.add(el.getAttribute("tag"));
    });
  });

  // ============================================================================
  // 5) Modal Perfil e Logout (ATUALIZADO)
  // ============================================================================
  const modaisDiv = document.getElementById("modais");

  function toggleModal(div) {
    modaisDiv?.classList.toggle("display-none");
    div?.classList.toggle("display-none");
  }

  const abrirProfile = document.getElementById("abrir-modal-perfil");
  const closeProfile = document.getElementById("fechar-perfil");
  const sairConta = document.getElementById("perfil-logout");
  const btnSalvarPerfil = document.getElementById("perfil-salvar");
  const modalPerfil = document.getElementById("perfil-user");
  const btnRedefinirInterno = document.querySelector(".modal-perfil .btn-login.mar-top15");

  async function carregarDadosPerfil() {
    try {
      // Fetch com credentials
      const fetcher = window.authFetch || fetch;
      const res = await fetcher("https://api.stamflow.com.br/auth/me", {
        method: "GET",
        credentials: 'include' // Cookies
      });

      if (res.ok) {
        const user = await res.json();
        const inpNome = document.getElementById("perfil-nome");
        const inpEmail = document.getElementById("perfil-email");

        if (inpNome) inpNome.value = user.nome_completo || "";
        if (inpEmail) inpEmail.value = user.email || "";
      } else {
        console.error("Erro ao carregar perfil (401?)");
      }
    } catch (error) {
      console.error("Erro de conexão perfil:", error);
    }
  }

  if (abrirProfile) {
    abrirProfile.addEventListener("click", () => {
      toggleModal(modalPerfil);
      carregarDadosPerfil();
    });
  }

  if (closeProfile) {
    closeProfile.addEventListener("click", () => {
      toggleModal(modalPerfil);
    });
  }

  if (sairConta) {
    sairConta.addEventListener("click", (e) => {
      e.preventDefault();
      // Logout via backend
      fetch("https://api.stamflow.com.br/auth/logout", { method: "POST", credentials: 'include' })
        .then(() => window.location.href = "https://login.stamflow.com.br/");
    });
  }

  if (btnSalvarPerfil) {
    btnSalvarPerfil.addEventListener("click", async (e) => {
      e.preventDefault();

      const nome = document.getElementById("perfil-nome")?.value || "";
      const email = document.getElementById("perfil-email")?.value || "";
      const originalText = btnSalvarPerfil.innerText;

      try {
        btnSalvarPerfil.innerText = "Salvando...";
        btnSalvarPerfil.disabled = true;

        const fetcher = window.authFetch || fetch;
        const res = await fetcher("https://api.stamflow.com.br/auth/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nome_completo: nome, email }),
          credentials: 'include'
        });

        if (res.ok) alert("Perfil atualizado com sucesso!");
        else alert("Erro ao atualizar perfil.");
      } catch (err) {
        console.error(err);
        alert("Erro de conexão.");
      } finally {
        btnSalvarPerfil.innerText = originalText;
        btnSalvarPerfil.disabled = false;
      }
    });
  }

  if (btnRedefinirInterno) {
    btnRedefinirInterno.addEventListener("click", async (e) => {
      e.preventDefault();

      const email = document.getElementById("perfil-email")?.value || "";
      if (!email) {
        alert("Por favor, certifique-se que o e-mail está preenchido.");
        return;
      }

      const originalText = btnRedefinirInterno.innerText;

      try {
        btnRedefinirInterno.innerText = "Enviando...";
        btnRedefinirInterno.disabled = true;

        // Recuperação é pública, não precisa de cookie (mas aceita se mandar)
        const response = await fetch("https://api.stamflow.com.br/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          alert(`Um link de redefinição foi enviado para ${email}.`);
        } else {
          alert("Erro ao solicitar redefinição.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro de conexão.");
      } finally {
        btnRedefinirInterno.innerText = originalText;
        btnRedefinirInterno.disabled = false;
      }
    });
  }
  
  
  
  // ============================================================================
    // 6) Close buttons -> voltar para "Statistics" (primeira sessão)
    // ============================================================================
    (function setupCloseButtonsGoToStats() {
      // Função que simula a navegação para a primeira sessão (Statistics)
      function goToStatisticsSection() {
        // Rebusca os elementos (mais seguro caso DOM mude)
        const navItems = document.querySelectorAll(".link-nav");
        const tituloSection = document.getElementById("section-name");
        const contents = document.querySelectorAll(".conteudo-site");
    
        const header = document.querySelector("header");
        const abrirHeader = document.querySelector(".abrir-header");
    
        if (!navItems.length || !contents.length) return;
    
        // 1) Atualiza título (como seu código faz)
        const firstTitle = navItems[0].getAttribute("title") || "Statistics";
        if (tituloSection) tituloSection.textContent = firstTitle;
    
        // 2) Marca o 1º nav item como ativo
        navItems.forEach((item) => item.classList.remove("ativo"));
        navItems[0].classList.add("ativo");
    
        // 3) Mostra a 1ª sessão e esconde as demais
        contents.forEach((content) => content.classList.add("display-none"));
        contents[0].classList.remove("display-none");
    
        // 4) Fecha header mobile se estiver aberto (igual seu comportamento)
        if (abrirHeader && header) {
          abrirHeader.classList.remove("ativo");
          header.classList.remove("clicado");
        }
    
        // 5) (Opcional) rolar pro topo do conteúdo
        // window.scrollTo({ top: 0, behavior: "smooth" });
      }
    
      // Clique em qualquer botão de fechar seção
      document.querySelectorAll(".close-btn-section").forEach((btn) => {
        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          goToStatisticsSection();
        });
      });
    })();

}
  document.addEventListener("DOMContentLoaded", _init);
  document.addEventListener("painelGestorReady", _init);
})();