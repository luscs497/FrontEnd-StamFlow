/* script.js - Lógica Global do Gestor (Cookies Version) */

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
    });
  });

  if (abrirHeader && header) {
    abrirHeader.addEventListener("click", () => {
      abrirHeader.classList.toggle("ativo");
      header.classList.toggle("clicado");
    });
  }

  // ============================================================================
  // 3) Dropdown de Períodos (Painel Principal)
  // ============================================================================
  const paineisGestor = document.querySelectorAll(".painel-gestor");
  const painelPrincipal = paineisGestor?.[0] || null;

  if (painelPrincipal) {
    const periodosContainer = painelPrincipal.querySelector(".periodos-navegacao");
    const periodosList = painelPrincipal.querySelector(".periodos");
    const periodos = periodosList ? periodosList.querySelectorAll(".periodo") : [];
    const periodosText = painelPrincipal.querySelectorAll(".periodo-text");

    const abrirSuspenso = painelPrincipal.querySelector("#abrir-periodos-mob");
    const suspensoContainer = periodosList ? periodosList.querySelector(".periodos-invisiveis") : null;
    const periodosSuspenso = suspensoContainer ? suspensoContainer.querySelectorAll(".periodo-suspenso") : [];

    function removerAtivoPeriodos(lista) {
      lista.forEach((e) => e.classList.remove("ativo"));
    }

    function atualizarPeriodoTexto(periodoKey) {
      let txt = "HOJE";
      if (periodoKey === "semana") txt = "ESSA SEMANA";
      if (periodoKey === "mes") txt = "ESSE MÊS";
      periodosText.forEach((e) => (e.textContent = txt));
    }

    function getAtivo(lista) {
      for (const el of lista) if (el.classList.contains("ativo")) return el;
      return null;
    }

    function esconderTodosPeriodosVisiveisExcetoAtivo() {
      if (!periodosList) return;
      // A seta do dropdown fica sempre escondida (removida no modo coluna).
      if (abrirSuspenso) abrirSuspenso.classList.add("display-none");

      if (!isMobile()) {
        periodos.forEach((e) => e.classList.remove("display-none"));
        if (suspensoContainer) suspensoContainer.classList.add("display-none");
        periodosContainer?.classList.remove("noBorderBottom");
        return;
      }

      const ativo = getAtivo(periodos);
      periodos.forEach((e) => e.classList.add("display-none"));
      if (ativo) ativo.classList.remove("display-none");
    }

    function sincronizarSuspensoComAtivo() {
      const ativo = getAtivo(periodos);
      if (!ativo) return;

      const ativoKey = ativo.getAttribute("periodo");
      periodosSuspenso.forEach((li) => {
        const key = li.getAttribute("periodo");
        if (key === ativoKey) li.classList.add("display-none");
        else li.classList.remove("display-none");
      });
    }

    function fecharDropdownPeriodos() {
      if (!suspensoContainer) return;
      suspensoContainer.classList.add("display-none");
      periodosContainer?.classList.remove("noBorderBottom");
    }

    function alternarDropdownPeriodos() {
      if (!suspensoContainer) return;
      const vaiAbrir = suspensoContainer.classList.contains("display-none");
      if (vaiAbrir) {
        sincronizarSuspensoComAtivo();
        suspensoContainer.classList.remove("display-none");
        periodosContainer?.classList.add("noBorderBottom");
      } else {
        fecharDropdownPeriodos();
      }
    }

    periodos.forEach((el) => {
      el.addEventListener("click", () => {
        if (isMobile() && el.classList.contains("ativo")) {
          // No mobile, clicar no chip já ativo abre/fecha o dropdown de períodos
          alternarDropdownPeriodos();
          return;
        }

        removerAtivoPeriodos(periodos);
        el.classList.add("ativo");

        const periodo = el.getAttribute("periodo") || "hoje";
        atualizarPeriodoTexto(periodo);

        if (isMobile()) {
          esconderTodosPeriodosVisiveisExcetoAtivo();
          sincronizarSuspensoComAtivo();
          fecharDropdownPeriodos();
        }
      });
    });

    periodosSuspenso.forEach((el) => {
      el.addEventListener("click", () => {
        const key = el.getAttribute("periodo");
        if (!key) return;

        removerAtivoPeriodos(periodos);
        periodos.forEach((p) => {
          if (p.getAttribute("periodo") === key) p.classList.add("ativo");
        });

        atualizarPeriodoTexto(key);

        if (isMobile()) {
          esconderTodosPeriodosVisiveisExcetoAtivo();
          sincronizarSuspensoComAtivo();
          fecharDropdownPeriodos();
        }
      });
    });

    if (abrirSuspenso) {
      abrirSuspenso.addEventListener("click", (ev) => {
        ev.stopPropagation();
        alternarDropdownPeriodos();
      });
    }

    if (periodosContainer && suspensoContainer) {
      clickOutside(periodosContainer, () => {
        if (!suspensoContainer.classList.contains("display-none")) fecharDropdownPeriodos();
      });
    }

    esconderTodosPeriodosVisiveisExcetoAtivo();
    sincronizarSuspensoComAtivo();

    window.addEventListener("resize", () => {
      esconderTodosPeriodosVisiveisExcetoAtivo();
      sincronizarSuspensoComAtivo();
      fecharDropdownPeriodos();
    });

    allListItems.forEach((el) => {
      el.addEventListener("click", () => fecharDropdownPeriodos());
    });
  }

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