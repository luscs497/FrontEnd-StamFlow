/**
 * Sistema de notificações StamFlow (frontend).
 *
 * Responsabilidades:
 *  - Sino no header com badge de não lidas.
 *  - Painel (dropdown) com a lista de notificações.
 *  - Polling do backend (eventos de sistema) a cada 60s e ao abrir o sino.
 *  - Persistência e exibição dos alertas de bem-estar (postura/pausa) que
 *    são gerados ao vivo pela câmera, via window.StamflowNotifications.
 *  - Pop-up nativo do navegador (Web Notifications API) quando permitido.
 *
 * Os alertas de bem-estar são empurrados pelo camera.js chamando
 * window.StamflowNotifications.pushLocalAlert(...).
 */
(function () {
  "use strict";

  const API_BASE = "https://api.stamflow.com.br";
  const POLL_INTERVAL_MS = 60000;

  // Mapeia o "link_destino" da notificação para o título do item de menu
  // correspondente (a navegação real é feita simulando clique no menu).
  const DESTINO_TO_MENU_TITLE = {
    "pausa-mental": "Mental Pause",
    "checkup": "Checkup Scan",
    "relatorios": "Insights & Analytics",
    "dashboard": "Dashboard",
  };

  // Ícone por tipo (SVG inline), com fallback para um sino genérico.
  function iconeParaTipo(tipo) {
    const sino =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';
    const pausa =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>';
    const postura =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
    const relatorio =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>';
    switch (tipo) {
      case "pausa_recomendada": return pausa;
      case "postura_critica":
      case "postura_atencao": return postura;
      case "relatorio_semanal":
      case "report_respondido": return relatorio;
      default: return sino;
    }
  }

  function tempoRelativo(isoString) {
    if (!isoString) return "";
    const data = new Date(isoString);
    const diffMs = Date.now() - data.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "agora";
    if (min < 60) return `há ${min} min`;
    const horas = Math.floor(min / 60);
    if (horas < 24) return `há ${horas}h`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `há ${dias}d`;
    return data.toLocaleDateString("pt-BR");
  }

  // Estado em memória.
  let _items = [];
  let _naoLidas = 0;
  let _painelAberto = false;
  let _pollTimer = null;

  // Elementos (resolvidos no init).
  let elSino, elBadge, elPainel, elLista, elVazio, elMarcarTodas;

  function authFetch(url, options) {
    const fn = window.authFetch || fetch;
    return fn(url, Object.assign({ credentials: "include" }, options || {}));
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  function atualizarBadge() {
    if (!elBadge) return;
    if (_naoLidas > 0) {
      elBadge.textContent = _naoLidas > 99 ? "99+" : String(_naoLidas);
      elBadge.classList.remove("display-none");
    } else {
      elBadge.classList.add("display-none");
    }
  }

  function renderLista() {
    if (!elLista) return;
    // Limpa tudo exceto o placeholder de vazio.
    elLista.querySelectorAll(".notificacao-item").forEach((n) => n.remove());

    if (!_items.length) {
      if (elVazio) elVazio.classList.remove("display-none");
      return;
    }
    if (elVazio) elVazio.classList.add("display-none");

    _items.forEach((n) => {
      const li = document.createElement("li");
      li.className = "notificacao-item" + (n.lida ? "" : " nao-lida");
      li.dataset.id = n.id != null ? String(n.id) : "";
      li.dataset.destino = n.link_destino || "";

      const icone = document.createElement("div");
      icone.className = "notificacao-item-icone";
      icone.innerHTML = iconeParaTipo(n.tipo);

      const conteudo = document.createElement("div");
      conteudo.className = "notificacao-item-conteudo";
      const titulo = document.createElement("span");
      titulo.className = "notificacao-item-titulo";
      titulo.textContent = n.titulo || "";
      const mensagem = document.createElement("span");
      mensagem.className = "notificacao-item-mensagem";
      mensagem.textContent = n.mensagem || "";
      const tempo = document.createElement("span");
      tempo.className = "notificacao-item-tempo";
      tempo.textContent = tempoRelativo(n.criada_em);
      conteudo.appendChild(titulo);
      conteudo.appendChild(mensagem);
      conteudo.appendChild(tempo);

      const seta = document.createElement("div");
      seta.className = "notificacao-item-seta";
      seta.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

      li.appendChild(icone);
      li.appendChild(conteudo);
      li.appendChild(seta);

      li.addEventListener("click", () => onClickNotificacao(n, li));
      elLista.appendChild(li);
    });
  }

  // ------------------------------------------------------------------
  // Navegação
  // ------------------------------------------------------------------
  function navegarPara(destino) {
    if (!destino) return;
    const title = DESTINO_TO_MENU_TITLE[destino];
    if (!title) return;
    // Simula clique no item de menu correspondente (mantém o app como
    // única fonte de verdade da navegação).
    const item = Array.from(document.querySelectorAll(".link-nav")).find(
      (el) => (el.getAttribute("title") || "").trim() === title
    );
    if (item) item.click();
  }

  async function onClickNotificacao(n, li) {
    // Marca como lida (otimista) e navega.
    if (!n.lida) {
      n.lida = true;
      if (li) li.classList.remove("nao-lida");
      _naoLidas = Math.max(0, _naoLidas - 1);
      atualizarBadge();
      // Persiste no backend só se a notificação tem id real (veio do servidor).
      if (n.id != null && !String(n.id).startsWith("local-")) {
        try {
          await authFetch(`${API_BASE}/notifications/${n.id}/read`, { method: "POST" });
        } catch (e) { /* silencioso: já atualizamos a UI */ }
      }
    }
    fecharPainel();
    navegarPara(n.link_destino);
  }

  // ------------------------------------------------------------------
  // Painel abrir/fechar
  // ------------------------------------------------------------------
  function abrirPainel() {
    if (!elPainel) return;
    elPainel.classList.remove("display-none");
    _painelAberto = true;
    // Ao abrir, puxa o estado mais recente.
    carregarNotificacoes();
  }

  function fecharPainel() {
    if (!elPainel) return;
    elPainel.classList.add("display-none");
    _painelAberto = false;
  }

  function togglePainel() {
    if (_painelAberto) fecharPainel();
    else abrirPainel();
  }

  // ------------------------------------------------------------------
  // Backend (polling)
  // ------------------------------------------------------------------
  async function carregarNotificacoes() {
    try {
      const res = await authFetch(`${API_BASE}/notifications?limit=30&offset=0`);
      if (!res.ok) return;
      const data = await res.json();
      // Mescla: mantém os alertas locais (gerados na sessão atual e ainda
      // não confirmados pelo servidor) no topo, seguidos dos do servidor.
      const locais = _items.filter(
        (i) => i.id != null && String(i.id).startsWith("local-")
      );
      const servidor = Array.isArray(data.items) ? data.items : [];
      _items = locais.concat(servidor);
      _naoLidas = (typeof data.nao_lidas === "number" ? data.nao_lidas : 0) +
        locais.filter((l) => !l.lida).length;
      atualizarBadge();
      if (_painelAberto) renderLista();
    } catch (e) {
      /* offline ou sem sessão: mantém o estado atual */
    }
  }

  async function atualizarContador() {
    try {
      const res = await authFetch(`${API_BASE}/notifications/unread-count`);
      if (!res.ok) return;
      const data = await res.json();
      const locaisNaoLidas = _items.filter(
        (i) => i.id != null && String(i.id).startsWith("local-") && !i.lida
      ).length;
      _naoLidas = (typeof data.nao_lidas === "number" ? data.nao_lidas : 0) + locaisNaoLidas;
      atualizarBadge();
    } catch (e) { /* silencioso */ }
  }

  async function marcarTodasLidas() {
    _items.forEach((n) => { n.lida = true; });
    _naoLidas = 0;
    atualizarBadge();
    renderLista();
    try {
      await authFetch(`${API_BASE}/notifications/read-all`, { method: "POST" });
    } catch (e) { /* silencioso */ }
  }

  // ------------------------------------------------------------------
  // Web Notifications API (pop-up nativo)
  // ------------------------------------------------------------------
  function pedirPermissaoNotificacao() {
    if (!("Notification" in window)) return;
    if (window.Notification.permission === "default") {
      // Pede de forma não intrusiva; só dispara pop-ups se concedido.
      window.Notification.requestPermission().catch(() => {});
    }
  }

  function dispararPopupNativo(titulo, mensagem, destino) {
    if (!("Notification" in window)) return;
    if (window.Notification.permission !== "granted") return;
    try {
      const notif = new window.Notification("StamFlow", {
        body: (titulo ? titulo + " — " : "") + (mensagem || ""),
        icon: "/StamFlowLogo-removebg-preview.png",
        badge: "/StamFlowLogo-removebg-preview.png",
        tag: "stamflow-" + (destino || "geral"),
      });
      notif.onclick = function () {
        window.focus();
        navegarPara(destino);
        notif.close();
      };
    } catch (e) { /* alguns navegadores exigem service worker; ignora */ }
  }

  // ------------------------------------------------------------------
  // API pública: alertas locais (chamada pelo camera.js)
  // ------------------------------------------------------------------
  let _localSeq = 0;

  function pushLocalAlert(opts) {
    // opts: { tipo, titulo, mensagem, link_destino }
    const alerta = {
      id: "local-" + (++_localSeq),
      tipo: opts.tipo || "pausa_recomendada",
      titulo: opts.titulo || "StamFlow",
      mensagem: opts.mensagem || "",
      link_destino: opts.link_destino || null,
      lida: false,
      criada_em: new Date().toISOString(),
    };
    // Insere no topo da lista em memória.
    _items.unshift(alerta);
    _naoLidas += 1;
    atualizarBadge();
    if (_painelAberto) renderLista();

    // Pop-up nativo (se permitido).
    dispararPopupNativo(alerta.titulo, alerta.mensagem, alerta.link_destino);

    // Persiste no backend para sobreviver a refresh (silencioso em caso de falha).
    persistirAlerta(alerta);
  }

  async function persistirAlerta(alerta) {
    try {
      const res = await authFetch(`${API_BASE}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: alerta.tipo,
          titulo: alerta.titulo,
          mensagem: alerta.mensagem,
          link_destino: alerta.link_destino,
        }),
      });
      if (res.ok) {
        const salvo = await res.json();
        // Substitui o id "local-" pelo id real, para futuras marcações de leitura.
        const idx = _items.findIndex((i) => i.id === alerta.id);
        if (idx !== -1 && salvo && salvo.id != null) {
          _items[idx].id = salvo.id;
        }
      }
    } catch (e) { /* mantém só em memória nesta sessão */ }
  }

  // ------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------
  function init() {
    elSino = document.getElementById("notificacoes-sino");
    elBadge = document.getElementById("notificacoes-badge");
    elPainel = document.getElementById("notificacoes-painel");
    elLista = document.getElementById("notificacoes-lista");
    elVazio = document.getElementById("notificacoes-vazio");
    elMarcarTodas = document.getElementById("notificacoes-marcar-todas");

    if (!elSino || !elPainel) return; // header sem sino: nada a fazer

    elSino.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePainel();
    });
    elSino.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        togglePainel();
      }
    });

    if (elMarcarTodas) {
      elMarcarTodas.addEventListener("click", (e) => {
        e.stopPropagation();
        marcarTodasLidas();
      });
    }

    // Clique fora fecha o painel.
    document.addEventListener("click", (e) => {
      if (!_painelAberto) return;
      if (elPainel.contains(e.target) || elSino.contains(e.target)) return;
      fecharPainel();
    });

    // Expõe a API para o camera.js.
    window.StamflowNotifications = {
      pushLocalAlert: pushLocalAlert,
      refresh: carregarNotificacoes,
    };

    // Permissão de notificação nativa (não intrusivo).
    pedirPermissaoNotificacao();

    // Primeira carga + polling do contador.
    atualizarContador();
    _pollTimer = setInterval(atualizarContador, POLL_INTERVAL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
