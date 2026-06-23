/* get-reports.js - Renderização de Relatórios e Home (StamFlow) */

const API_BASE_URL = "https://api.stamflow.com.br";
const API_REPORTS_URL = `${API_BASE_URL}/reports/dashboard`;

/**
 * Converte Date -> YYYY-MM-DD usando horário LOCAL (evita bug do UTC)
 */
function toISODateLocal(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDateAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODateLocal(d);
}

function safeInt(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? Math.trunc(x) : fallback;
}

function pluralize(n, singular, plural) {
  return n === 1 ? singular : plural;
}

async function fetchReportData(token_unused, startDate, endDate) {
  // O token_unused não é mais necessário (vem via cookie), mas mantivemos o parâmetro
  // para compatibilidade com chamadas antigas se houver.
  const url = `${API_REPORTS_URL}?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;

  try {
    const fetchFunc = window.authFetch || fetch;
    const response = await fetchFunc(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Authorization removido! O Cookie faz o trabalho.
      },
      credentials: 'include' // <--- IMPORTANTE: Envia o cookie access_token
    });

    if (!response.ok) {
      console.warn("⚠️ fetchReportData response not ok:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Erro de conexão:", error);
    return null;
  }
}

// ============================================================================
// 1) HOME (ABA "HOJE")
// ============================================================================
function classifyStamina(pct) {
  if (pct >= 85) return { key: "excelente", label: "Excelente", colorClass: "excelente" };
  if (pct >= 70) return { key: "boa", label: "Boa", colorClass: "boa" };
  if (pct >= 50) return { key: "atencao", label: "Atenção", colorClass: "atencao" };
  return { key: "critica", label: "Crítica", colorClass: "critica" };
}

function showAvisoByStaminaKey(key) {
  const map = {
    excelente: document.querySelector(".aviso-excelente"),
    boa: document.querySelector(".aviso-bom"),
    atencao: document.querySelector(".aviso-atencao"),
    critica: document.querySelector(".aviso-critico"),
  };

  Object.values(map).forEach((el) => {
    if (el) el.classList.add("display-none");
  });

  // backend: excelente, bom, ruim, critico
  // UI: excelente, boa, atencao, critica
  if (key === "bom") key = "boa";
  if (key === "ruim") key = "atencao";
  if (key === "critico") key = "critica";

  const alvo = map[key];
  if (alvo) alvo.classList.remove("display-none");
}

/**
 * Extrai conquistas de forma compatível com variações de backend:
 * - Preferimos chaves *_feitas (se existirem)
 * - Se não, usamos *_realizadas (se existirem)
 */
function extractConquistas(obj) {
  if (!obj || typeof obj !== "object") {
    return { pausas: 0, exercicios: 0, diasExcelente: 0 };
  }

  const pausas =
    obj.pausas_mentais_feitas ?? obj.pausas_mentais_realizadas ?? obj.pausas ?? 0;
  const exercicios =
    obj.exercicios_feitos ?? obj.exercicios_realizados ?? obj.exercicios ?? 0;

  const diasExcelente =
    obj.dias_stamina_excelente ?? obj.dias_excelentes ?? obj.diasExcelente ?? 0;

  return {
    pausas: safeInt(pausas, 0),
    exercicios: safeInt(exercicios, 0),
    diasExcelente: safeInt(diasExcelente, 0),
  };
}

function updateHomeTodayUI(data) {
  if (!data) return;

  // 1) Tempo total
  const elTempoTela = document.getElementById("tempo-tela");
  if (elTempoTela) elTempoTela.textContent = data.tempo_total_uso || "0min";

  // 2) Barras laterais (Relatório do Dia)
  const updateCategory = (backendKey, htmlKey) => {
    const percent = data.distribuicao_tempo ? (data.distribuicao_tempo[backendKey] || 0) : 0;
    const absTime = data.tempos_absolutos ? (data.tempos_absolutos[backendKey] || "0min") : "0min";
    const bar = document.getElementById(`today-${htmlKey}-bar`);
    const val = document.getElementById(`today-${htmlKey}-value`);
    const time = document.getElementById(`today-${htmlKey}-time`);
    if (bar) bar.style.width = `${percent}%`;
    if (val) val.textContent = `${percent}%`;
    if (time) time.textContent = absTime;
  };
  updateCategory("excelente", "excelente");
  updateCategory("bom", "bom");
  updateCategory("ruim", "ruim");
  updateCategory("critico", "critico");

  // 3) STAMINA GERAL (ao vivo) -> NÃO sobrescrever aqui.
  //    A barra #stamina-preenchida e a porcentagem/status são controladas em
  //    tempo real pelo camera.js (reflete a captação atual). A média do período
  //    aparece na seção de relatórios (media-diaria etc.), não na barra ao vivo.
  //    Antes, este bloco escrevia a média histórica (ex.: 28%) na barra ao vivo,
  //    fazendo o painel "iniciar com 28%" mesmo sem câmera.

  // 4) Conquistas
  const conquistasHoje = extractConquistas(data.conquistas_periodo || data.conquistas_hoje || data);
  const elPausasHoje = document.getElementById("pausas-feitas");
  const elExercHoje = document.getElementById("exercicios-feitos");

  if (elPausasHoje) {
    const n = conquistasHoje.pausas;
    elPausasHoje.textContent = `${n} ${pluralize(n, "pausa", "pausas")}`;
  }
  if (elExercHoje) {
    const n = conquistasHoje.exercicios;
    elExercHoje.textContent = `${n} ${pluralize(n, "exercício", "exercícios")}`;
  }
}

// ============================================================================
// 2) ABA "RELATÓRIOS"
// ============================================================================
function updateDashboardUI(data, titulo, tipoPeriodo = "semana") {
  if (!data) return;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("titulo-periodo", titulo);
  setTxt("media-diaria", data.stamina_media ?? "--");
  setTxt("melhor-dia", data.melhor_dia ?? "--");
  setTxt("pior-dia", data.pior_dia ?? "--");
  setTxt("tempo-total", data.tempo_total_uso ?? "--");

  // Distribuição
  if (data.distribuicao_tempo) {
    const updateHistBar = (key, idBar, idTxt) => {
      const elBar = document.getElementById(idBar);
      const elTxt = document.getElementById(idTxt);
      const val = data.distribuicao_tempo[key] || 0;
      if (elBar) elBar.style.width = `${val}%`;
      if (elTxt) elTxt.textContent = `${val}%`;
    };

    updateHistBar("excelente", "periodo-excelente-preenchida", "excelente-periodo-valor");
    updateHistBar("bom", "periodo-bom-preenchida", "bom-periodo-valor");
    updateHistBar("ruim", "periodo-ruim-preenchida", "ruim-periodo-valor");
    updateHistBar("critico", "periodo-critica-preenchida", "critico-periodo-valor");
  }

  // ✅ Conquistas do período
  const conquistasPeriodo = extractConquistas(data.conquistas_periodo || data);

  const ul = document.querySelector(".conquistas-periodo");
  if (ul) {
    const items = ul.querySelectorAll("li");

    if (items[0]) {
      const h5 = items[0].querySelector("h5");
      if (h5) h5.textContent = String(conquistasPeriodo.pausas);
    }

    if (items[1]) {
      const h5 = items[1].querySelector("h5");
      if (h5) h5.textContent = String(conquistasPeriodo.exercicios);
    }

    if (items[2]) {
      const h5 = items[2].querySelector("h5");
      if (h5) {
        const n = conquistasPeriodo.diasExcelente;
        h5.textContent = `${n} ${pluralize(n, "dia", "dias")}`;
      }
    }
  }

  const h3 = document.querySelector(".conquistas > h3.orange");
  if (h3) {
    const mapTitulo = {
      semana: "Conquistas da Semana",
      mes: "Conquistas do Mês",
      trimestre: "Conquistas do Trimestre",
      semestre: "Conquistas do Semestre",
      ano: "Conquistas do Ano",
    };
    const svg = h3.querySelector("svg");
    h3.innerHTML = "";
    if (svg) h3.appendChild(svg);
    h3.appendChild(document.createTextNode(" " + (mapTitulo[tipoPeriodo] || "Conquistas do Período")));
  }
}

// ============================================================================
// 3) INIT
// ============================================================================
window.addEventListener("load", async () => {
  console.log("🚀 get-reports.js iniciado (Cookies Mode)");

  // REMOVIDO: Verificação de localStorage. Se não tiver cookie, o fetch falha e tratamos lá.
  // const token = localStorage.getItem("accessToken");
  
  const hoje = new Date();
  const strHoje = toISODateLocal(hoje);

  // --- HOME (HOJE) ---
  async function refreshHomeData() {
    const todayData = await fetchReportData(null, strHoje, strHoje);
    if (todayData) updateHomeTodayUI(todayData);
    else console.log("⚠️ Sem dados de hoje ou não autenticado.");
  }

  window.refreshHomeData = refreshHomeData;

  await refreshHomeData();
  setInterval(refreshHomeData, 30000);

  // --- RELATÓRIOS: default Semana ---
  const weekData = await fetchReportData(null, getDateAgo(7), strHoje);
  updateDashboardUI(weekData, "Estatísticas da Semana", "semana");

  // --- Troca de período (Semana / Mês / etc.) ---
  const periodosRelatorio = document.querySelectorAll(".periodo");
  const periodMap = {
    semana: { dias: 7, titulo: "Estatísticas da Semana" },
    mes: { dias: 30, titulo: "Estatísticas do Mês" },
    trimestre: { dias: 90, titulo: "Estatísticas do Trimestre" },
    semestre: { dias: 180, titulo: "Estatísticas do Semestre" },
    ano: { dias: 365, titulo: "Estatísticas do Ano" },
  };

  function setPeriodoAtivo(clicked) {
    // mantém tua lógica: qualquer .periodo pode ficar ativo (nav ou nv)
    periodosRelatorio.forEach((p) => {
      p.classList.remove("ativo");
      p.classList.remove("ativo-report");
    });
    clicked.classList.add("ativo");
    clicked.classList.add("ativo-report");
  }

  // --- Dropdown períodos no mobile (AJUSTADO) ---
  const periodosNav = document.querySelectorAll(".periodo-nav");       // linha “visível” (desktop)
  const periodosInvisiveis = document.querySelectorAll(".periodo-nav-nv"); // itens do dropdown
  const abrirPeriodo = document.getElementById("abrir-periodo");
  const listPeriodo = document.getElementById("periodos-nao-visiveis");

  const MOBILE_MAX = 678;

  const toggleDisplay = (el, show) => el && el.classList.toggle("display-none", !show);

  // pega o tipo ativo prioritariamente pelos .periodo-nav
  function getActiveTipo() {
    const activeNav = document.querySelector(".periodo-nav.ativo");
    if (activeNav) return activeNav.getAttribute("periodo") || "semana";

    // fallback: qualquer .periodo ativo
    const activeAny = document.querySelector(".periodo.ativo");
    return (activeAny && activeAny.getAttribute("periodo")) || "semana";
  }

  // força o “ativo” correto nas duas listas (nav e nv) sem depender do index
  function syncActiveBetweenNavAndDropdown(tipo) {
    // marca ativo nos .periodo-nav
    periodosNav.forEach((el) => {
      el.classList.toggle("ativo", (el.getAttribute("periodo") || "") === tipo);
    });

    // marca ativo nos .periodo-nav-nv (não é obrigatório, mas ajuda se quiser estilizar)
    periodosInvisiveis.forEach((el) => {
      el.classList.toggle("ativo", (el.getAttribute("periodo") || "") === tipo);
    });
  }

  // ✅ regra: no mobile, manter UL e manter só o selecionado na faixa visível
  // e no dropdown esconder o selecionado (pra não repetir)
  function applyPeriodoLayout() {
    const isMobile = window.innerWidth <= MOBILE_MAX;
    if (!abrirPeriodo || !listPeriodo) return;

    const tipoAtivo = getActiveTipo();

    if (isMobile) {
      // mostra o botão
      abrirPeriodo.classList.remove("display-none");

      // mantém a UL visível, mas só deixa aparecer o item ativo
      periodosNav.forEach((el) => {
        const tipo = el.getAttribute("periodo") || "";
        const isActive = tipo === tipoAtivo;
        el.classList.toggle("display-none", !isActive);
      });

      // no dropdown: mostrar todos, menos o ativo
      periodosInvisiveis.forEach((el) => {
        const tipo = el.getAttribute("periodo") || "";
        el.classList.toggle("display-none", tipo === tipoAtivo);
      });

      // começa fechado
      listPeriodo.classList.add("display-none");
    } else {
      // desktop: esconde botão e dropdown
      abrirPeriodo.classList.add("display-none");
      listPeriodo.classList.add("display-none");

      // mostra todos os .periodo-nav (barra inteira)
      periodosNav.forEach((el) => el.classList.remove("display-none"));

      // dropdown “resetado”
      periodosInvisiveis.forEach((el) => el.classList.remove("display-none"));
    }
  }

  // botão abre/fecha dropdown
  if (abrirPeriodo && listPeriodo) {
    abrirPeriodo.addEventListener("click", () => {
      listPeriodo.classList.toggle("display-none");
    });
  }

  // clique em qualquer período (nav ou dropdown)
  periodosRelatorio.forEach((el) => {
    el.addEventListener("click", async () => {
      // ignora clique no botão seta (ele não tem class .periodo, mas só por segurança)
      const tipo = el.getAttribute("periodo") || "";
      if (!tipo) return;

      setPeriodoAtivo(el);

      const config = periodMap[tipo] || periodMap.semana;
      const data = await fetchReportData(null, getDateAgo(config.dias), strHoje);
      updateDashboardUI(data, config.titulo, tipo);

      // ✅ sincroniza “ativo” nas duas listas
      syncActiveBetweenNavAndDropdown(tipo);

      // ✅ fecha dropdown se estiver aberto
      if (listPeriodo) listPeriodo.classList.add("display-none");

      // ✅ reaplica layout (mobile = só ativo visível / dropdown sem duplicado)
      applyPeriodoLayout();
    });
  });

  // garante que no load o ativo esteja coerente e layout correto
  syncActiveBetweenNavAndDropdown(getActiveTipo());
  applyPeriodoLayout();

  // no resize/orientação
  window.addEventListener("resize", applyPeriodoLayout);

  // ========================================================================
  // syncConquista (mantém igual, mas com cookies)
  // ========================================================================
  window.syncConquista = async function syncConquista({ pausas = 0, exercicios = 0 } = {}) {
    // REMOVIDO: Verificação de localStorage. O backend barra se não tiver cookie.
    
    const hoje = toISODateLocal(new Date());
    const url = "https://api.stamflow.com.br/reports/sync";

    const fetchFunc = window.authFetch || fetch;

    const payload = {
      date: hoje
    };

    if (pausas > 0) payload.pausas_mentais_feitas = pausas;
    if (exercicios > 0) payload.exercicios_feitos = exercicios;

    const res = await fetchFunc(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: 'include' // <--- IMPORTANTE: Envia cookie
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("❌ Falha ao syncConquista:", res.status, txt);
      return;
    }

    console.log("✅ Conquista enviada!", payload);

    if (typeof window.refreshHomeData === "function") {
      await window.refreshHomeData();
    }
  };
});