/* script.js - Lógica Global de UI e Navegação */

document.addEventListener("DOMContentLoaded", async () => {
  // ============================================================
  // Áudios protegidos por URL assinada.
  // O backend confere sessão + assinatura ativa e devolve uma URL válida
  // por uma janela de tempo. O Nginx do CDN valida a assinatura antes de
  // servir o arquivo.
  // ============================================================
  const urlAssinadaCache = new Map();

  async function obterUrlAssinada(path) {
    if (!path) return path;
    if (/^https?:\/\//i.test(path)) return path; // já é URL absoluta

    const agora = Math.floor(Date.now() / 1000);
    const cacheado = urlAssinadaCache.get(path);
    // Margem de 60s: evita usar uma URL que expira no meio do carregamento.
    if (cacheado && cacheado.expires - 60 > agora) return cacheado.url;

    const resp = await window.authFetch(
      `https://api.stamflow.com.br/audio/sign?path=${encodeURIComponent(path)}`,
      { credentials: "include" }
    );
    if (!resp.ok) throw new Error(`Falha ao autorizar o áudio (${resp.status})`);

    const dados = await resp.json();
    urlAssinadaCache.set(path, dados);
    return dados.url;
  }
  const audioEl = document.getElementById("modal-audio-el");
  const slider = document.getElementById("modal-audio-progres");
  const playBtn = document.getElementById("modal-audio-pause");

  let currentTrack = null;
  let isSeeking = false;

  // ============================================================
  // 1. Autenticação/autorização já validada pelo LegacyBootstrap
  //    (gate roda antes deste script). Aqui só removemos o overlay.
  // ============================================================
  const authOverlay = document.getElementById("auth-overlay");
  if (authOverlay) authOverlay.remove();
  // ============================================================
  // 2. Navegação Lateral (Tabs)
  // ============================================================
  const allListItems = document.querySelectorAll(".link-nav");
  const tituloSection = document.getElementById("section-name");

  allListItems.forEach((el) => {
    el.addEventListener("click", () => {
      const title = el.getAttribute("title");
      const color = el.getAttribute("color");
      if (tituloSection) {
        tituloSection.className = color;
        tituloSection.textContent = title;
      }
    });
  });

  const contents = document.querySelectorAll(".conteudo-site");
  const listItems = [];

  if (allListItems.length > 0) {
    allListItems.forEach((item) => {
      if (item.parentElement.tagName === "UL") listItems.push(item);
    });
    if (!document.querySelector(".link-nav.ativo") && listItems[0]) {
      listItems[0].classList.add("ativo");
    }
  }

  listItems.forEach((element, index) => {
    element.addEventListener("click", () => {
      listItems.forEach((el) => el.classList.remove("ativo"));
      element.classList.add("ativo");
      if (contents[index]) {
        contents.forEach((c) => c.classList.add("display-none"));
        contents[index].classList.remove("display-none");
      }
    });
  });

  // ============================================================
  // 3. Sub-menus (Dropdowns na Sidebar)
  // ============================================================
  const navLinks = document.querySelectorAll(".tem-sub-lista-selector");
  const navSubListas = document.querySelectorAll(".sub-lista");

  navLinks.forEach((element, index) => {
    element.addEventListener("click", () => {
      if (navSubListas[index]) {
        navSubListas[index].classList.toggle("display-none");
      }
    });
  });

  // ============================================================
  // 4. Pop-ups de Exercícios / Mental / Foco
  // ============================================================
  const popUpGeral = document.getElementById("pop-ups");
  const popUps = document.querySelectorAll(".pop-up");

  const abrirExercicio = document.querySelectorAll(".exercicio-audio-player");
  abrirExercicio.forEach((el) => {
    el.addEventListener("click", () => {
      if (popUpGeral) popUpGeral.classList.remove("display-none");
      if (popUps[0]) popUps[0].classList.remove("display-none");
    });
  });

  const closePopUp = document.querySelectorAll(".close-timer-pop-up");
  closePopUp.forEach((el) => {
    el.addEventListener("click", () => {
      if (popUpGeral) popUpGeral.classList.add("display-none");
      popUps.forEach((e) => e.classList.add("display-none"));
      if (typeof resetTimerState === "function") resetTimerState();
    });
  });

  const abrirPausaMental = document.querySelectorAll(".abrir-popup.mental");
  const abrirFoco = document.querySelectorAll(".abrir-popup.foco");

  abrirPausaMental.forEach((el) => {
    el.addEventListener("click", () => {
      if (popUpGeral) popUpGeral.classList.remove("display-none");
      if (popUps[1]) popUps[1].classList.remove("display-none");
    });
  });

  abrirFoco.forEach((el) => {
    el.addEventListener("click", () => {
      if (popUpGeral) popUpGeral.classList.remove("display-none");
      if (popUps[2]) popUps[2].classList.remove("display-none");
    });
  });

  // ============================================================
  // 5. Header Mobile
  // ============================================================
  const header = document.querySelector("header");
  const abrirHeader = document.querySelector(".abrir-header");

  if (abrirHeader && header) {
    allListItems.forEach((el) => {
      el.addEventListener("click", () => {
        abrirHeader.classList.toggle("ativo");
        header.classList.remove("clicado");
      });
    });
    abrirHeader.addEventListener("click", () => {
      abrirHeader.classList.toggle("ativo");
      header.classList.toggle("clicado");
    });
  }

  // ============================================================
  // 6. Perfil e Logout
  // ============================================================
  const abrirProfile = document.getElementById("abrir-modal-perfil");
  const closeProfile = document.getElementById("fechar-perfil");
  const sairConta = document.getElementById("perfil-logout");
  const btnSalvarPerfil = document.getElementById("perfil-salvar");
  const modalPerfil = document.getElementById("perfil-user");
  const btnRedefinirInterno = document.querySelector(".modal-perfil .btn-login.mar-top15");
  const modaisDiv = document.getElementById("modais");

  function toggleModal(div) {
    if (modaisDiv) modaisDiv.classList.toggle("display-none");
    if (div) div.classList.toggle("display-none");
  }

  async function carregarDadosPerfil() {
    try {
      const res = await window.authFetch("https://api.stamflow.com.br/auth/me", {
        method: "GET",
      });
      if (res.ok) {
        const user = await res.json();
        const inpNome = document.getElementById("perfil-nome");
        const inpEmail = document.getElementById("perfil-email");
        // Sanitiza antes de inserir no DOM (previne XSS)
        if (inpNome) inpNome.value = String(user.nome_completo || "");
        if (inpEmail) inpEmail.value = String(user.email || "");

        // Banner de e-mail não verificado
        _renderEmailBanners(user);
      }
    } catch (error) {
      console.error("Erro de conexão perfil:", error);
    }
  }

  function _renderEmailBanners(user) {
    document.querySelectorAll(".stamflow-email-banner").forEach((el) => el.remove());
    const container = document.getElementById("modal-perfil") || document.body;
    const insertBefore = document.getElementById("perfil-nome")?.closest("label") || null;
    function _banner(html) {
      const div = document.createElement("div");
      div.className = "stamflow-email-banner";
      div.style.cssText = "margin:0 0 14px 0;padding:12px 16px;border-radius:12px;font-size:13.5px;line-height:1.55;";
      div.innerHTML = html;
      if (insertBefore && insertBefore.parentNode) { insertBefore.parentNode.insertBefore(div, insertBefore); }
      else { container.prepend(div); }
      return div;
    }
    if (!user.email_verificado) {
      const b = _banner(
        `<span style="color:#f59e0b;font-weight:600;">⚠ Verifique seu e-mail</span><br>
         <span style="color:#94a3b8;">Enviamos um link para <strong style="color:#e2e8f0;">${user.email}</strong>.
         Clique nele para liberar todos os recursos da conta.</span>`
      );
      b.style.background = "rgba(245,158,11,0.08)";
      b.style.border = "1px solid rgba(245,158,11,0.25)";
    }
    if (user.pending_email) {
      const b = _banner(
        `<span style="color:#38bdf8;font-weight:600;">✉ Troca de e-mail pendente</span><br>
         <span style="color:#94a3b8;">Enviamos um link de confirmação para
         <strong style="color:#e2e8f0;">${user.pending_email}</strong>.
         Verifique sua caixa de entrada para concluir a alteração.</span>`
      );
      b.style.background = "rgba(56,189,248,0.06)";
      b.style.border = "1px solid rgba(56,189,248,0.2)";
    }
  }

  if (abrirProfile) {
    abrirProfile.addEventListener("click", () => {
      toggleModal(modalPerfil);
      carregarDadosPerfil();
    });
  }

  if (closeProfile) {
    closeProfile.addEventListener("click", () => toggleModal(modalPerfil));
  }

  if (sairConta) {
    sairConta.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await fetch("https://api.stamflow.com.br/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Erro no logout:", err);
      } finally {
        localStorage.removeItem("onboardingCompleted");
        localStorage.removeItem("userCalibration");
        window.location.href = "https://login.stamflow.com.br/";
      }
    });
  }

  if (btnSalvarPerfil) {
    btnSalvarPerfil.addEventListener("click", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("perfil-nome")?.value?.trim() || "";
      const email = document.getElementById("perfil-email")?.value?.trim() || "";
      const originalText = btnSalvarPerfil.innerText;

      // Validação básica no cliente
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Por favor, insira um e-mail válido.");
        return;
      }

      try {
        btnSalvarPerfil.innerText = "Salvando...";
        btnSalvarPerfil.disabled = true;

        const res = await window.authFetch("https://api.stamflow.com.br/auth/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome_completo: nome, email }),
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.email_change_pending) {
            alert(
              "Perfil atualizado!\n\nEnviamos um link de confirmação para o novo e-mail.\nVerifique sua caixa de entrada para concluir a troca."
            );
          } else {
            alert("Perfil atualizado com sucesso!");
          }
          carregarDadosPerfil();
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.detail || "Erro ao atualizar perfil.");
        }
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
      const email = document.getElementById("perfil-email")?.value?.trim() || "";
      if (!email) {
        alert("Por favor, certifique-se que o e-mail está preenchido.");
        return;
      }
      const originalText = btnRedefinirInterno.innerText;
      try {
        btnRedefinirInterno.innerText = "Enviando...";
        btnRedefinirInterno.disabled = true;
        const response = await fetch("https://api.stamflow.com.br/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (response.ok) {
          alert(`Um link de redefinição foi enviado para ${email}. Verifique sua caixa de entrada.`);
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

  // ============================================================
  // 7. Onboarding
  // ============================================================
  const onboardingContainer = document.getElementById("on-boarding");

  if (onboardingContainer && localStorage.getItem("onboardingCompleted") === "true") {
    onboardingContainer.classList.add("display-none");
  }

  if (typeof Swiper !== "undefined" && onboardingContainer) {
    const cores = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#14B8A6"];
    const swiperBoarding = new Swiper(".swiper-onboarding", {
      loop: false,
      slidesPerView: 1,
      autoHeight: true,
      navigation: { nextEl: ".next-boarding", prevEl: ".prev" },
      pagination: { el: ".pagination", clickable: false },
      on: {
        init: function () {
          document.documentElement.style.setProperty("--bullet-active-color", cores[0]);
        },
        slideChange: function () {
          const novaCor = cores[this.realIndex % cores.length];
          document.documentElement.style.setProperty("--bullet-active-color", novaCor);
        },
      },
    });

    const btnSkip = document.querySelector(".skip");
    if (btnSkip) {
      btnSkip.addEventListener("click", (e) => {
        e.preventDefault();
        swiperBoarding.slideTo(swiperBoarding.slides.length - 1, 600);
      });
    }

    const btnSlide4 = document.getElementById("fechar-boarding");
    if (btnSlide4) {
      btnSlide4.addEventListener("click", (e) => {
        e.preventDefault();
        swiperBoarding.slideNext();
      });
    }
  }

  document.addEventListener("click", (e) => {
    const target = e.target.closest("#ativar-sistema");
    if (target && onboardingContainer) {
      onboardingContainer.classList.add("display-none");
      localStorage.setItem("onboardingCompleted", "true");
      const btnCalibrar = document.getElementById("btn-send-metrics");
      if (btnCalibrar) {
        setTimeout(() => btnCalibrar.click(), 100);
      }
    }
  });

  // ============================================================
  // 8. Termos de Uso
  // ============================================================
  const checkbox = document.getElementById("aceitar");
  const botaoTermos = document.querySelector(".btn.btn-gray-white");

  if (checkbox && botaoTermos) {
    function atualizarBotao() {
      botaoTermos.disabled = !checkbox.checked;
      botaoTermos.classList.toggle("btn-ativo", checkbox.checked);
    }
    atualizarBotao();
    checkbox.addEventListener("change", atualizarBotao);
  }

  // ============================================================
  // 9. Dados de áudio por categoria
  // ============================================================
  const exerciciosSvgs = [
    '<svg class="green" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    '<svg class="green" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
    '<svg class="green" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path></svg>',
    '<svg class="green" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
    '<svg class="green" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    '<svg class="green" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    '<svg class="green" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
  ];

  const mentalSvgs = [
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="19" x2="8" y2="21"></line><line x1="8" y1="13" x2="8" y2="15"></line><line x1="16" y1="19" x2="16" y2="21"></line><line x1="16" y1="13" x2="16" y2="15"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="12" y1="15" x2="12" y2="17"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  ];

  const focoSvgs = [
    '<svg class="orange" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
    '<svg class="orange" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',
    '<svg class="orange" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    '<svg class="orange" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>',
    '<svg class="orange" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>',
    '<svg class="orange" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
    '<svg class="orange" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>',
  ];

  const universitySvgs = [
    '<svg class="blue" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
    '<svg class="blue" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
    '<svg class="blue" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
  ];

  const modalAudio = document.getElementById("modal-audio");

  const globalData = {};
  const configCategoria = {
    exercicios: { svgs: exerciciosSvgs, cor: "green" },
    mental: { svgs: mentalSvgs, cor: "purple" },
    foco: { svgs: focoSvgs, cor: "orange" },
    university: { svgs: universitySvgs, cor: "blue" },
  };

  let playerState = { categoria: null, groupIndex: 0, itemIndex: 0 };

  function formatarDuracao(segundos) {
    if (!Number.isFinite(segundos) || segundos <= 0) return "--:--";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  }

  function gerarHTML(dados, cor, svg, categoria, groupIndex, itemIndex) {
    const li = document.createElement("li");
    li.addEventListener("click", () => playTrackByIndex(categoria, groupIndex, itemIndex));
    li.classList.add("audio-minimizado");

    const divLeft = document.createElement("div");
    divLeft.classList.add("audio-div-left");
    const divLeftText = document.createElement("div");
    divLeftText.classList.add("audio-minimizado-text", "gap-16");
    const titulo = document.createElement("h3");
    titulo.classList.add(cor);
    titulo.textContent = dados.titulo;
    const descricao = document.createElement("p");
    descricao.textContent = dados.descricao;
    const divRight = document.createElement("div");
    divRight.classList.add("audio-div-right");
    const tempoAudio = document.createElement("p");
    tempoAudio.classList.add("audio-audio-time");
    tempoAudio.textContent = formatarDuracao(dados.duracaoSegundos);
    const audioPlayer = document.createElement("div");
    audioPlayer.classList.add("audio-audio-player");
    audioPlayer.innerHTML =
      '<svg class="audio-audio-player-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';

    divLeftText.appendChild(titulo);
    divLeftText.appendChild(descricao);
    divLeft.insertAdjacentHTML("afterbegin", svg);
    divLeft.appendChild(divLeftText);
    li.appendChild(divLeft);

    // Link "Explicação da meditação" — somente na categoria "mental"
    // (Pausa Mental). Estrutura: uma coluna externa (alinhada à direita)
    // contendo a linha [tempo + play] e, abaixo, o link sozinho.
    if (categoria === "mental" && dados.comoAjuda) {
      divRight.classList.add("audio-div-right-com-explicacao");

      const timePlayRow = document.createElement("div");
      timePlayRow.classList.add("audio-time-play-row");
      timePlayRow.appendChild(tempoAudio);
      timePlayRow.appendChild(audioPlayer);
      divRight.appendChild(timePlayRow);

      const comoAjudaLink = document.createElement("div");
      comoAjudaLink.classList.add("modal-cientifico-abrir", "audio-como-ajuda-abrir");
      comoAjudaLink.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="6.4" height="6.4" viewBox="0 0 8 8" aria-hidden="true"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg><p>Explicação da meditação</p>';
      comoAjudaLink.addEventListener("click", (ev) => {
        ev.stopPropagation(); // não deve disparar o play do áudio
        abrirComoAjudaModal(dados);
      });
      divRight.appendChild(comoAjudaLink);
    } else {
      divRight.appendChild(tempoAudio);
      divRight.appendChild(audioPlayer);
    }

    li.appendChild(divRight);
    return li;
  }

  function gerarAudiosMinimizados(grupo) {
    const listaAudios = document.querySelectorAll(".audios");
    const catMap = { exercicio: "exercicios", mental: "mental", foco: "foco", university: "university" };
    const listaAlvo = [...listaAudios].filter(
      (el) => catMap[el.getAttribute("categoria")] === grupo
    );

    // Corrigido: usa path absoluto /data/ em vez de ../data/
    fetch(`/data/${grupo}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((dados) => {
        globalData[grupo] = dados;
        const config = configCategoria[grupo];
        dados.forEach((el, groupIndex) => {
          el.forEach((e, itemIndex) => {
            const item = gerarHTML(e, config.cor, config.svgs[itemIndex] || config.svgs[0], grupo, groupIndex, itemIndex);
            if (listaAlvo[groupIndex]) listaAlvo[groupIndex].appendChild(item);
          });
        });
      })
      .catch((err) => console.error(`Erro ao carregar ${grupo}.json:`, err));
  }

  function gerarModalAudio(dados, cor, svg, categoria) {
    if (modalAudio && modalAudio.classList.contains("display-none")) {
      toggleModal(modalAudio);
    }
    modalAudio.setAttribute("categoria", categoria);
    const titulo = document.getElementById("modal-audio-titulo");
    const descricao = document.getElementById("modal-audio-descricao");
    const svgDiv = document.getElementById("modal-audio-svg");
    titulo.classList.remove("green", "purple", "orange", "blue");
    titulo.classList.add(cor);
    titulo.textContent = dados.titulo;
    descricao.textContent = dados.descricao;
    svgDiv.innerHTML = svg;
    loadAndPlayTrack({ dados, cor, svg, categoria });
  }

  // Popup "Explicação da meditação" (Pausa Mental).
  // Reaproveita UM único popup no mesmo estilo visual do popup-embasamento,
  // trocando o conteúdo a cada áudio clicado (mesmo padrão do modal de áudio).
  const modalComoAjuda = document.getElementById("modal-como-ajuda");
  function abrirComoAjudaModal(dados) {
    if (!modalComoAjuda) return;
    const titulo = document.getElementById("modal-como-ajuda-titulo");
    const texto = document.getElementById("modal-como-ajuda-texto");
    if (titulo) titulo.textContent = dados.titulo;
    if (texto) texto.textContent = dados.comoAjuda || "";
    if (modalComoAjuda.classList.contains("display-none")) {
      toggleModal(modalComoAjuda);
    }
  }

  ["fechar-como-ajuda", "fechar-como-ajuda-button"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn && modalComoAjuda) btn.addEventListener("click", () => toggleModal(modalComoAjuda));
  });

  function playTrackByIndex(categoria, gIndex, iIndex) {
    playerState = { categoria, groupIndex: gIndex, itemIndex: iIndex };
    const dadosItem = globalData[categoria][gIndex][iIndex];
    const config = configCategoria[categoria];
    gerarModalAudio(dadosItem, config.cor, config.svgs[iIndex] || config.svgs[0], categoria);
  }

  function nextTrack() {
    const { categoria, groupIndex, itemIndex } = playerState;
    if (!categoria || !globalData[categoria]) return;
    const grupos = globalData[categoria];
    if (itemIndex < grupos[groupIndex].length - 1) playTrackByIndex(categoria, groupIndex, itemIndex + 1);
    else if (groupIndex < grupos.length - 1) playTrackByIndex(categoria, groupIndex + 1, 0);
    else playTrackByIndex(categoria, 0, 0);
  }

  function prevTrack() {
    const { categoria, groupIndex, itemIndex } = playerState;
    if (!categoria || !globalData[categoria]) return;
    const grupos = globalData[categoria];
    if (itemIndex > 0) playTrackByIndex(categoria, groupIndex, itemIndex - 1);
    else if (groupIndex > 0) {
      const prev = groupIndex - 1;
      playTrackByIndex(categoria, prev, grupos[prev].length - 1);
    } else {
      const last = grupos.length - 1;
      playTrackByIndex(categoria, last, grupos[last].length - 1);
    }
  }

  gerarAudiosMinimizados("exercicios");
  gerarAudiosMinimizados("mental");
  gerarAudiosMinimizados("university");
  gerarAudiosMinimizados("foco");

  const fecharModalAudio = document.getElementById("fechar-modal-audio");
  if (fecharModalAudio) {
    fecharModalAudio.addEventListener("click", () => {
      toggleModal(modalAudio);
      stopAudio({ resetTime: true });
      if (slider) { slider.value = 0; slider.style.background = ""; }
    });
  }

  const btnNext = document.querySelector(".mental-next");
  const btnPrev = document.querySelector(".mental-prev");
  if (btnNext) btnNext.addEventListener("click", (e) => { e.stopPropagation(); nextTrack(); });
  if (btnPrev) btnPrev.addEventListener("click", (e) => { e.stopPropagation(); prevTrack(); });

  // ============================================================
  // 10. Audio Engine
  // ============================================================
  const ICONS = {
    play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    pause: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
  };

  function setPlayIcon(isPlaying) {
    if (playBtn) playBtn.innerHTML = isPlaying ? ICONS.pause : ICONS.play;
  }

  function stopAudio({ resetTime = true } = {}) {
    if (!audioEl) return;
    audioEl.pause();
    if (resetTime) audioEl.currentTime = 0;
    setPlayIcon(false);
    if (slider) slider.value = 0;
  }

  function updateSliderUI() {
    if (!slider || !audioEl) return;
    const duration = Number.isFinite(audioEl.duration) ? audioEl.duration : 0;
    const current = Number.isFinite(audioEl.currentTime) ? audioEl.currentTime : 0;
    const pct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
    slider.value = pct;
    paintSliderWithActiveColor(pct);
  }

  function paintSliderWithActiveColor(valuePct) {
    if (!slider) return;
    const titulo = document.getElementById("modal-audio-titulo");
    const corAtiva = titulo ? getComputedStyle(titulo).color : "#34D399";
    slider.style.background = `linear-gradient(to right, ${corAtiva} 0%, ${corAtiva} ${valuePct}%, #374151 ${valuePct}%, #374151 100%)`;
  }

  // Flag para garantir que a conquista só é registrada na 1ª conclusão
  // de cada faixa (não repete a cada loop). Resetada em loadAndPlayTrack.
  let conquistaRegistrada = false;

  // Conta tentativas de renovação da URL assinada para a faixa atual. Zerada
  // a cada nova faixa; limitada no listener de "error" abaixo para não
  // martelar /audio/sign quando o erro não é expiração (ex.: arquivo
  // ausente, CSP bloqueando) e a renovação nunca vai resolver.
  let tentativasRenovacao = 0;

  async function loadAndPlayTrack(track) {
    currentTrack = track;
    conquistaRegistrada = false; // reseta para nova faixa poder registrar conquista
    tentativasRenovacao = 0;
    stopAudio({ resetTime: true });

    try {
      audioEl.src = await obterUrlAssinada(track.dados.audioPath);
    } catch (err) {
      console.error("Não foi possível autorizar o áudio:", err);
      setPlayIcon(false);
      return;
    }

    audioEl.play().then(() => setPlayIcon(true)).catch(() => setPlayIcon(false));
  }

  if (audioEl) {
    audioEl.addEventListener("timeupdate", () => { if (!isSeeking) updateSliderUI(); });
    audioEl.addEventListener("loadedmetadata", updateSliderUI);
    audioEl.addEventListener("ended", () => {
      // Loop: ao terminar, volta ao início e continua tocando.
      audioEl.currentTime = 0;
      audioEl.play().then(() => setPlayIcon(true)).catch(() => {
        setPlayIcon(false);
        if (slider) { slider.value = 0; paintSliderWithActiveColor(0); }
      });
    });
    // Se a URL assinada expirar durante uma sessão longa, o elemento dispara
    // erro ao buscar o próximo trecho. Renovamos e retomamos do mesmo ponto.
    audioEl.addEventListener("error", async () => {
      console.warn("Erro ao carregar áudio:", audioEl.src);
      if (!currentTrack || !currentTrack.dados || !currentTrack.dados.audioPath) {
        setPlayIcon(false);
        return;
      }
      if (tentativasRenovacao >= 1) {
        // Já tentamos renovar uma vez para esta faixa; se falhou de novo não
        // é expiração — é um erro persistente. Desiste para não martelar o
        // endpoint de assinatura.
        console.error("Erro persistente ao carregar áudio; desistindo da renovação automática.");
        setPlayIcon(false);
        return;
      }
      tentativasRenovacao++;

      const posicao = audioEl.currentTime;
      urlAssinadaCache.delete(currentTrack.dados.audioPath);

      try {
        audioEl.src = await obterUrlAssinada(currentTrack.dados.audioPath);
        audioEl.currentTime = posicao;
        audioEl.play().catch(() => setPlayIcon(false));
      } catch (err) {
        console.error("Falha ao renovar a autorização do áudio:", err);
        setPlayIcon(false);
      }
    });

    // Conquistas ao terminar o áudio pela PRIMEIRA vez (não repete no loop).
    audioEl.addEventListener("ended", async () => {
      if (conquistaRegistrada) return;
      conquistaRegistrada = true;
      const categoria = modalAudio?.getAttribute("categoria");
      if (typeof window.syncConquista !== "function") return;
      if (categoria === "exercicios") await window.syncConquista({ exercicios: 1 });
      else if (categoria === "mental") await window.syncConquista({ pausas: 1 });
    });
  }

  if (slider) {
    slider.addEventListener("pointerdown", () => { isSeeking = true; });
    slider.addEventListener("pointerup", () => { isSeeking = false; updateSliderUI(); });
    slider.addEventListener("input", () => {
      const pct = Number(slider.value);
      paintSliderWithActiveColor(pct);
      const duration = audioEl && Number.isFinite(audioEl.duration) ? audioEl.duration : 0;
      if (duration > 0) audioEl.currentTime = (pct / 100) * duration;
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!audioEl || !audioEl.src) return;
      if (audioEl.paused) {
        audioEl.play().then(() => setPlayIcon(true)).catch(() => setPlayIcon(false));
      } else {
        audioEl.pause();
        setPlayIcon(false);
      }
    });
  }

  // ============================================================
  // 11. Modais de Embasamento
  // ============================================================
  function setupModal(abrirId, fecharIds = []) {
    const modal = typeof abrirId === "string" ? document.getElementById(abrirId) : abrirId;
    return { modal };
  }

  [
    { abrirId: "abrir-embasamento-exercicios", modalId: "modal-embasamento-exercicios", fecharIds: ["fechar-embasamento-exercicios", "fechar-embasamento-button"] },
    { abrirId: "abrir-embasamento-mental", modalId: "modal-embasamento-mental", fecharIds: ["fechar-embasamento-mental", "fechar-embasamento-mental-button"] },
    { abrirId: "abrir-embasamento-foco", modalId: "modal-embasamento-foco", fecharIds: ["fechar-embasamento-foco", "fechar-embasamento-foco-button"] },
  ].forEach(({ abrirId, modalId, fecharIds }) => {
    const modal = document.getElementById(modalId);
    const btnAbrir = document.getElementById(abrirId);
    if (btnAbrir && modal) btnAbrir.addEventListener("click", () => toggleModal(modal));
    fecharIds.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn && modal) btn.addEventListener("click", () => toggleModal(modal));
    });
  });

  // Modal "Como melhorar minha Stamina" — acionável por vários ícones (?)
  // espalhados pela UI (Dashboard, Checkup e card de energia do scan).
  const modalComoMelhorar = document.getElementById("modal-como-melhorar-stamina");
  if (modalComoMelhorar) {
    document.querySelectorAll(".abrir-como-melhorar-stamina").forEach((el) => {
      el.addEventListener("click", () => toggleModal(modalComoMelhorar));
      // Acessibilidade: os ícones são role="button", então respondem a Enter/Espaço.
      el.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          toggleModal(modalComoMelhorar);
        }
      });
    });
  }
  ["fechar-como-melhorar-stamina", "fechar-como-melhorar-stamina-button"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn && modalComoMelhorar) btn.addEventListener("click", () => toggleModal(modalComoMelhorar));
  });

  // Modal Privacidade Tickets
  const modalPrivacidade = document.getElementById("modal-privacidade-tickets");
  ["abrir-politica"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn && modalPrivacidade) btn.addEventListener("click", () => toggleModal(modalPrivacidade));
  });
  ["close-popup-politica", "compreendi"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn && modalPrivacidade) btn.addEventListener("click", () => toggleModal(modalPrivacidade));
  });

  // ============================================================
  // 12. Clique no Status do Sistema (reativar câmera)
  // ============================================================
  const divSistemaStatus = document.querySelector(".sistema");
  if (divSistemaStatus) {
    divSistemaStatus.style.cursor = "pointer";
    divSistemaStatus.title = "Clique para reativar a câmera e calibrar";
    divSistemaStatus.addEventListener("click", async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (err) {
        console.warn("Permissão de câmera não obtida:", err);
      }
      const btnCalibrar = document.getElementById("btn-send-metrics");
      if (btnCalibrar) setTimeout(() => btnCalibrar.click(), 200);
    });
  }

  // ============================================================
  // 13. Detalhes de Áudio (accordion)
  // O parágrafo descritivo (.audio-classificacao-detalhes) é sempre
  // visível desde o carregamento. A seta controla apenas a lista de
  // áudios (.audios).
  // ============================================================
  const listaAbrirDescricoes = document.querySelectorAll(".abrir-audios-details");
  listaAbrirDescricoes.forEach((el) => {
    el.addEventListener("click", () => {
      const item = el.closest(".audio-classificacao");
      if (!item) return;
      const audios = item.querySelector(".audios");
      const abrindo = audios ? audios.classList.contains("display-none") : false;
      if (audios) audios.classList.toggle("display-none", !abrindo);
      el.classList.toggle("audios-details-aberto", abrindo);
    });
  });

  // ============================================================
  // 14. Voltar ao Dashboard (.close-btn-section)
  // ============================================================
  const voltarPDash = document.querySelectorAll(".close-btn-section");

  function irParaDashboard() {
    let dashNavItem = null;
    let dashIndex = -1;
    for (let i = 0; i < listItems.length; i++) {
      if ((listItems[i].getAttribute("title") || "").trim().toLowerCase() === "dashboard") {
        dashNavItem = listItems[i];
        dashIndex = i;
        break;
      }
    }
    if (!dashNavItem && listItems[0]) { dashNavItem = listItems[0]; dashIndex = 0; }
    if (!dashNavItem || dashIndex < 0) return;

    listItems.forEach((el) => el.classList.remove("ativo"));
    dashNavItem.classList.add("ativo");
    if (contents[dashIndex]) {
      contents.forEach((c) => c.classList.add("display-none"));
      contents[dashIndex].classList.remove("display-none");
    }
    if (tituloSection) {
      tituloSection.className = dashNavItem.getAttribute("color") || "";
      tituloSection.textContent = dashNavItem.getAttribute("title") || "Dashboard";
    }
    if (abrirHeader && header) {
      abrirHeader.classList.remove("ativo");
      header.classList.remove("clicado");
    }
  }

  voltarPDash.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      irParaDashboard();
    });
  });
});
