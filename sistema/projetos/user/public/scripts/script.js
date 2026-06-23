/* script.js - Lógica Global de UI e Navegação */

document.addEventListener("DOMContentLoaded", async () => {
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
          alert("Perfil atualizado com sucesso!");
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
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    '<svg class="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
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
    tempoAudio.textContent = "00:45";
    const audioPlayer = document.createElement("div");
    audioPlayer.classList.add("audio-audio-player");
    audioPlayer.innerHTML =
      '<svg class="audio-audio-player-svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';

    divLeftText.appendChild(titulo);
    divLeftText.appendChild(descricao);
    divLeft.insertAdjacentHTML("afterbegin", svg);
    divLeft.appendChild(divLeftText);
    li.appendChild(divLeft);
    divRight.appendChild(tempoAudio);
    divRight.appendChild(audioPlayer);
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
            const item = gerarHTML(e, config.cor, config.svgs[groupIndex] || config.svgs[0], grupo, groupIndex, itemIndex);
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

  function playTrackByIndex(categoria, gIndex, iIndex) {
    playerState = { categoria, groupIndex: gIndex, itemIndex: iIndex };
    const dadosItem = globalData[categoria][gIndex][iIndex];
    const config = configCategoria[categoria];
    gerarModalAudio(dadosItem, config.cor, config.svgs[gIndex] || config.svgs[0], categoria);
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

  function loadAndPlayTrack(track) {
    currentTrack = track;
    stopAudio({ resetTime: true });
    audioEl.src = track.dados.audioPath;
    audioEl.play().then(() => setPlayIcon(true)).catch(() => setPlayIcon(false));
  }

  if (audioEl) {
    audioEl.addEventListener("timeupdate", () => { if (!isSeeking) updateSliderUI(); });
    audioEl.addEventListener("loadedmetadata", updateSliderUI);
    audioEl.addEventListener("ended", () => {
      setPlayIcon(false);
      if (slider) { slider.value = 0; paintSliderWithActiveColor(0); }
    });
    audioEl.addEventListener("error", () => {
      console.warn("Erro ao carregar áudio:", audioEl.src);
      setPlayIcon(false);
    });

    // Conquistas ao terminar o áudio
    audioEl.addEventListener("ended", async () => {
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
  // ============================================================
  const listaAbrirDescricoes = document.querySelectorAll(".abrir-audios-details");
  listaAbrirDescricoes.forEach((el) => {
    el.addEventListener("click", () => {
      const item = el.closest(".audio-classificacao");
      if (!item) return;
      const detalhes = item.querySelector(".audio-classificacao-detalhes");
      const audios = item.querySelector(".audios");
      const abrindo = audios ? audios.classList.contains("display-none") : false;
      if (detalhes) detalhes.classList.toggle("display-none", !abrindo);
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
