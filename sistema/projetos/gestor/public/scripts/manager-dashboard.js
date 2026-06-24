/* manager-dashboard.js - Lógica do Painel do Gestor (Team View) - Cookies Version */

const API_TEAM_URL = "https://api.stamflow.com.br/reports/team-dashboard";
const API_TEAM_ACHIEVEMENTS_URL = "https://api.stamflow.com.br/reports/team-achievements";
const API_TICKETS_URL = "https://api.stamflow.com.br/tickets/company-tickets";

// --- Utilitários de Data (LOCAL, evita bug UTC) ---
function toISODateLocal(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
const getToday = () => toISODateLocal(new Date());
const getDateAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODateLocal(d);
};

// ---------------------------
// Específico-mês helpers
// ---------------------------
// monthOffset: 0 = mês atual, 1 = mês anterior, 2 = dois meses atrás, ...
function getMonthRange(monthOffset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const endRaw = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = endRaw > today ? today : endRaw;
  return {
    start_date: toISODateLocal(start),
    end_date: toISODateLocal(end),
  };
}

const MONTH_NAMES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatMonthLabel(monthOffset = 0) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const name = MONTH_NAMES_PT[d.getMonth()];
  return d.getFullYear() === now.getFullYear()
    ? name
    : `${name} ${d.getFullYear()}`;
}

// Mapas de Períodos para Dias
const PERIOD_MAP = {
  hoje: 0,
  semana: 7,
  mes: 30,
  trimestre: 90,
};

// ---------------------------
// Fetch helpers (com Auth via Cookies)
// ---------------------------
async function fetchJsonWithAuth(url, label = "REQ") {
  try {
    const fetchFunc = window.authFetch || fetch;

    const res = await fetchFunc(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include'
    });

    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      console.warn(`[${label}] Erro na resposta:`, res.status);
      return null;
    }

    return json;
  } catch (err) {
    console.error(`[${label}] erro rede:`, err);
    return null;
  }
}

async function fetchTeamData(startDate, endDate) {
  const url = `${API_TEAM_URL}?start_date=${startDate}&end_date=${endDate}`;
  return await fetchJsonWithAuth(url, "TEAM");
}

async function fetchTeamAchievements(startDate, endDate) {
  const url = `${API_TEAM_ACHIEVEMENTS_URL}?start_date=${startDate}&end_date=${endDate}`;
  return await fetchJsonWithAuth(url, "ACH");
}

async function fetchTicketsCount(startDate, endDate) {
  const fetchFunc = window.authFetch || fetch;

  try {
    const res = await fetchFunc(API_TICKETS_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include'
    });

    if (!res.ok) return 0;

    const tickets = await res.json();
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    return (tickets || []).filter((t) => {
      const dateString = t.criado_em || t.created_at || t.atualizado_em;
      const dt = new Date(dateString);
      return dt >= start && dt <= end;
    }).length;
  } catch (e) {
    console.error("Erro ao contar tickets:", e);
    return 0;
  }
}

// ---------------------------
// Merge achievements -> data
// ---------------------------
function injectTeamAchievementsIntoData(data, teamAch) {
  if (!data) return data;

  const total =
    teamAch?.total ??
    teamAch?.conquistas?.total ??
    teamAch?.data?.total ??
    teamAch?.conquistas_periodo ??
    null;

  const pausas =
    total?.pausas_mentais_feitas ??
    total?.pausas_mentais ??
    total?.pausas ??
    teamAch?.pausas_mentais_feitas ??
    0;

  const exercicios =
    total?.exercicios_feitos ??
    total?.exercicios ??
    teamAch?.exercicios_feitos ??
    0;

  data.conquistas_periodo = {
    pausas_mentais_feitas: Number(pausas) || 0,
    exercicios_feitos: Number(exercicios) || 0,
  };

  return data;
}

// ============================================================================
// FUNÇÃO DE RENDERIZAÇÃO GENÉRICA (Atualiza um container específico)
// ============================================================================
function renderMetricsInContainer(container, data) {
  if (!container || !data) return;

  const findById = (id) => container.querySelector(`[id="${id}"]`);
  const find = (selector) => container.querySelector(selector);

  const updateBar = (idElemento, val) => {
    const bar = findById(idElemento);
    if (!bar) return;

    const v = Number(val) || 0;
    bar.style.width = `${v}%`;

    const parent = bar.closest(".barra-porcentagem");
    if (parent) {
      const txt = parent.querySelector(".porcentagem");
      if (txt) txt.textContent = `${v}%`;
    }
  };

  // 1) Stamina (distribuicao_tempo)
  if (data.distribuicao_tempo) {
    const d = data.distribuicao_tempo;
    updateBar("excelende-bar-preenchida", d.excelente);
    updateBar("boa-bar-preenchida", d.bom);
    updateBar("ruim-bar-preenchida", d.ruim);
    updateBar("critico-bar-preenchida", d.critico);
  }

  // 2) Humor (distribuicao_humor)
  if (data.distribuicao_humor) {
    const h = data.distribuicao_humor;
    updateBar("alegria-bar-preenchida", h.happy);
    updateBar("neutro-bar-preenchida", h.neutral);
    updateBar("raiva-bar-preenchida", h.angry);
    updateBar("tristeza-bar-preenchida", h.sad);
  }

  // 3) Ergonomia (detalhes_ergonomia)
  if (data.detalhes_ergonomia) {
    const e = data.detalhes_ergonomia;

    const colorize = (el, status) => {
      if (!el) return;
      el.textContent = status;
      el.className = "classificacao-status";
      if (String(status).includes("Excelente")) el.classList.add("color-excelente");
      else if (String(status).includes("Boa")) el.classList.add("color-boa");
      else if (String(status).includes("Atenção")) el.classList.add("color-ruim");
      else if (String(status).includes("Crítica")) el.classList.add("color-critico");
    };

    colorize(find("#status-lombro"), e.rotation_status);
    colorize(find("#status-iombros"), e.shoulder_status);
    colorize(find("#status-pcabeca"), e.head_status);
    colorize(find("#status-dorso"), e.back_status);
  }

  // 4) Engajamento + KPIs
  const eng = data.engajamento || {};

  const elSisAtivo = find("#porcentagem-sa");
  if (elSisAtivo) elSisAtivo.textContent = data.tempo_total_uso || "0min";

  const exercicios =
    data.conquistas_periodo?.exercicios_feitos ??
    eng.exercicios_feitos ??
    eng.exercicios ??
    0;

  const pausas =
    data.conquistas_periodo?.pausas_mentais_feitas ??
    eng.pausas_mentais_feitas ??
    eng.pausas ??
    0;

  const elExer = find("#porcentagem-er");
  if (elExer) elExer.textContent = String(Number(exercicios) || 0);

  const elPausas = find("#porcentagem-pm");
  if (elPausas) elPausas.textContent = String(Number(pausas) || 0);

  const ticketsTotal = eng.tickets_total ?? eng.reports_total ?? eng.queixas_reports ?? 0;

  const elQueixa = find("#porcentagem-qr");
  if (elQueixa) elQueixa.textContent = String(Number(ticketsTotal) || 0);
}

// ============================================================================
// Helpers de período (robusto)
// ============================================================================
function periodoKeyFromLabel(label) {
  const raw = String(label || "").toLowerCase().trim();

  if (raw.includes("hoje")) return "hoje";
  if (raw.includes("semana")) return "semana";
  if (raw.includes("mês") || raw.includes("mes")) return "mes";
  if (raw.includes("trimestre")) return "trimestre";

  return "hoje";
}

function periodoLabelFromKey(key) {
  if (key === "hoje") return "HOJE";
  if (key === "semana") return "ESSA SEMANA";
  if (key === "mes") return "ESSE MÊS";
  if (key === "trimestre") return "TRIMESTRE";
  return String(key || "HOJE").toUpperCase();
}

// ============================================================================
// LÓGICA DE INICIALIZAÇÃO
// ============================================================================
(function () {
  function _initDash() {
    const gestorPanel = document.querySelector(".painel-gestor");
    if (!gestorPanel) return;

    console.log("👔 Painel do Gestor Iniciado");

    // Formata "2026-06-17" -> "17/06" para o rótulo de cada card. Mantém o
    // ano só quando ele difere do ano atual, para não poluir o rótulo no
    // caso comum (período dentro do mesmo ano). Compartilhada pela Visão
    // Principal e pela Visão de Comparação.
    function formatDateLabel(isoDate) {
      if (!isoDate) return "";
      const [y, m, d] = isoDate.split("-");
      const currentYear = new Date().getFullYear();
      return Number(y) === currentYear ? `${d}/${m}` : `${d}/${m}/${y}`;
    }

    function formatRangeLabel(startIso, endIso) {
      if (!startIso || !endIso) return "";
      if (startIso === endIso) return formatDateLabel(startIso);
      return `${formatDateLabel(startIso)} - ${formatDateLabel(endIso)}`;
    }

    // ---------------------------
    // 1) VISÃO PRINCIPAL
    // ---------------------------
    const mainInsightsContainer = document.querySelector(".lista-insights");
    const inputInicioPrincipal = document.getElementById("data-inicio-principal");
    const inputFimPrincipal = document.getElementById("data-fim-principal");

    async function loadMainView(startDate, endDate) {
      if (!startDate || !endDate || !mainInsightsContainer) return;

      // Garante ordem cronológica correta mesmo se o usuário escolher a
      // data final antes da inicial.
      const [inicio, fim] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];

      const [data, teamAch, qtdTickets] = await Promise.all([
        fetchTeamData(inicio, fim),
        fetchTeamAchievements(inicio, fim),
        fetchTicketsCount(inicio, fim),
      ]);

      if (!data) return;

      injectTeamAchievementsIntoData(data, teamAch);

      data.engajamento = data.engajamento || {};
      data.engajamento.tickets_total = qtdTickets;

      renderMetricsInContainer(mainInsightsContainer, data);

      const txt = formatRangeLabel(inicio, fim);
      mainInsightsContainer.querySelectorAll(".periodo-text").forEach((p) => {
        p.textContent = txt.toUpperCase();
      });
    }

    function loadMainViewFromInputs() {
      loadMainView(inputInicioPrincipal?.value, inputFimPrincipal?.value);
    }

    [inputInicioPrincipal, inputFimPrincipal].forEach((el) =>
      el?.addEventListener("change", loadMainViewFromInputs)
    );

    // Estado inicial: hoje (início = fim = hoje), preservando o
    // comportamento padrão que já existia ("Hoje" pré-selecionado).
    (function initMainViewDefault() {
      const hoje = getToday();
      if (inputInicioPrincipal) inputInicioPrincipal.value = hoje;
      if (inputFimPrincipal) inputFimPrincipal.value = hoje;
      loadMainView(hoje, hoje);
    })();

    // ---------------------------
    // 2) VISÃO DE COMPARAÇÃO
    // ---------------------------
    const btnComparar = document.getElementById("comparar");
    const allContainersA = document.querySelectorAll(".sc-prazo-a");
    const allContainersB = document.querySelectorAll(".sc-prazo-b");

    const inputInicioA = document.getElementById("data-inicio-a");
    const inputFimA = document.getElementById("data-fim-a");
    const inputInicioB = document.getElementById("data-inicio-b");
    const inputFimB = document.getElementById("data-fim-b");

    async function loadComparisonColumn(nodeListContainers, startDate, endDate) {
      if (!nodeListContainers || nodeListContainers.length === 0) return;
      if (!startDate || !endDate) return;

      // Garante ordem cronológica correta mesmo se o usuário escolher a
      // data final antes da inicial nos inputs.
      const [inicio, fim] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];

      const [data, teamAch, qtdTickets] = await Promise.all([
        fetchTeamData(inicio, fim),
        fetchTeamAchievements(inicio, fim),
        fetchTicketsCount(inicio, fim),
      ]);

      if (!data) return;

      injectTeamAchievementsIntoData(data, teamAch);

      data.engajamento = data.engajamento || {};
      data.engajamento.tickets_total = qtdTickets;

      const label = formatRangeLabel(inicio, fim);
      nodeListContainers.forEach((container) => {
        renderMetricsInContainer(container, data);

        const txt = container.querySelector(".periodo-text");
        if (txt) txt.textContent = label.toUpperCase();
      });
    }

    function loadColumnA() {
      loadComparisonColumn(allContainersA, inputInicioA?.value, inputFimA?.value);
    }

    function loadColumnB() {
      loadComparisonColumn(allContainersB, inputInicioB?.value, inputFimB?.value);
    }

    [inputInicioA, inputFimA].forEach((el) => el?.addEventListener("change", loadColumnA));
    [inputInicioB, inputFimB].forEach((el) => el?.addEventListener("change", loadColumnB));

    if (btnComparar) {
      btnComparar.addEventListener("click", () => {
        const hoje = getToday();
        const semanaAtras = getDateAgo(7);

        // Estado inicial ao abrir a comparação: PERIODO A = hoje,
        // PERIODO B = últimos 7 dias — preserva o comportamento padrão que
        // já existia (Hoje vs Semana), só que agora como datas editáveis.
        if (inputInicioA) inputInicioA.value = hoje;
        if (inputFimA) inputFimA.value = hoje;
        if (inputInicioB) inputInicioB.value = semanaAtras;
        if (inputFimB) inputFimB.value = hoje;

        loadColumnA();
        loadColumnB();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", _initDash);
  document.addEventListener("painelGestorReady", _initDash);
})();

/* ============================================================================
   MÓDULO DE EXPORTAÇÃO DE RELATÓRIOS (Integrado)
============================================================================ */

(function () {
  function _initExport() {
    const btnExportTrigger = document.getElementById("btn-export-trigger");
    const exportDropdown = document.getElementById("export-list");
    const exportOptions = document.querySelectorAll(".export-dropdown li");

    // 1. Toggle do Dropdown
    if (btnExportTrigger && exportDropdown) {
      btnExportTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        exportDropdown.classList.toggle("display-none");
      });

      document.addEventListener("click", (e) => {
        if (!btnExportTrigger.contains(e.target) && !exportDropdown.contains(e.target)) {
          exportDropdown.classList.add("display-none");
        }
      });
    }

    // 2. Função Auxiliar: Obter Datas (YYYY-MM-DD) do período selecionado
    //    nos inputs de data da Visão Principal (antes era lido do chip
    //    Hoje/Semana/Mês, que não existe mais).
    function getDatesFromActiveTab() {
      const inicioEl = document.getElementById("data-inicio-principal");
      const fimEl = document.getElementById("data-fim-principal");
      const inicio = inicioEl?.value;
      const fim = fimEl?.value;

      if (!inicio || !fim) {
        const hoje = toISODateLocal(new Date());
        return { start_date: hoje, end_date: hoje };
      }

      // Garante ordem cronológica correta mesmo se o usuário escolher a
      // data final antes da inicial.
      const [start_date, end_date] = inicio <= fim ? [inicio, fim] : [fim, inicio];
      return { start_date, end_date };
    }

    // 3. Lógica de Download
    exportOptions.forEach((option) => {
      option.addEventListener("click", async () => {
        const format = option.getAttribute("data-format");
        const { start_date, end_date } = getDatesFromActiveTab();

        const originalText = option.innerHTML;
        option.innerHTML = "Baixando...";
        option.style.pointerEvents = "none";

        try {
          const url = `https://api.stamflow.com.br/reports/export?start_date=${start_date}&end_date=${end_date}&format=${format}`;

          const fetcher = window.authFetch || fetch;
          const response = await fetcher(url, {
            method: 'GET',
            credentials: 'include',
          });

          // 404 = não há dados no período selecionado (não é erro de sistema)
          if (response.status === 404) {
            exportDropdown.classList.add("display-none");
            alert("Nenhum dado encontrado para o período selecionado. Os relatórios aparecem aqui depois que a equipe registrar atividade no StamFlow.");
            return;
          }

          if (!response.ok) throw new Error("Erro na exportação");

          const blob = await response.blob();

          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `relatorio_stamflow_${start_date}_${end_date}.${format}`;
          document.body.appendChild(a);
          a.click();

          document.body.removeChild(a);
          window.URL.revokeObjectURL(downloadUrl);

          exportDropdown.classList.add("display-none");
        } catch (error) {
          console.error("Erro ao exportar:", error);
          alert("Não foi possível gerar o relatório. Tente novamente.");
        } finally {
          option.innerHTML = originalText;
          option.style.pointerEvents = "auto";
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", _initExport);
  document.addEventListener("painelGestorReady", _initExport);
})();