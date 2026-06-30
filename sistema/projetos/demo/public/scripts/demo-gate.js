/* demo-gate.js — Limitações da versão DEMO (decisão de produto, 2026-06)
 *
 * Este módulo é exclusivo do build "demo" (demo.stamflow.com.br). Ele:
 *   1. Pergunta ao backend (GET /account/profile) se a conta logada está em
 *      status DEMO. A verdade sobre "é demo ou não" SEMPRE vem do backend —
 *      nunca confiamos em um valor local/hardcoded, porque o usuário pode
 *      inspecionar/alterar JS no navegador.
 *   2. Expõe window.DemoGate com funções que o script.js consulta nos
 *      pontos de navegação/reprodução de áudio, para:
 *        - bloquear com paywall as categorias "mental", "foco", "university"
 *        - bloquear com cadeado a seção de Relatórios/Insights & Analytics
 *        - limitar a quantidade de exercícios guiados ("exercicio") tocados
 *
 * IMPORTANTE: esta é uma camada de UX (evita o usuário clicar e não entender
 * por que nada abriu). A proteção REAL contra contornar o limite está no
 * backend (ex.: GET /reports/dashboard retorna 403 para contas DEMO via a
 * dependency block_demo_users — ver auditoria de segurança). Mesmo que
 * alguém burle esta camada via DevTools, a rota da API continua bloqueada.
 */
(function () {
  "use strict";

  const API = "https://api.stamflow.com.br";

  // Categorias de áudio completamente bloqueadas no demo.
  const BLOCKED_CATEGORIES = new Set(["mental", "foco", "university"]);

  // Limite de exercícios guiados ("categoria=exercicio") que podem ser
  // tocados durante TODO o período de demo (7 dias). Armazenado em
  // localStorage por client_id, para sobreviver a refresh de página.
  // (Servidor não impõe este teto específico hoje — é apenas UX. A trava
  // de segurança real do backend está nas rotas de feature, não na
  // contagem de áudios tocados.)
  const EXERCISE_LIMIT_TOTAL = 5;

  let _profileCache = null;
  let _isDemoAccount = false;
  let _clientId = null;

  async function fetchProfile() {
    if (_profileCache) return _profileCache;
    try {
      const res = await fetch(`${API}/account/profile`, { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();
      _profileCache = data;
      _isDemoAccount = data?.assinatura?.status === "DEMO";
      _clientId = data?.conta?.id ?? null;
      return data;
    } catch {
      return null;
    }
  }

  function exerciseCountKey() {
    return `stamflow_demo_exercicios_usados_${_clientId ?? "anon"}`;
  }

  function getExerciseCount() {
    const raw = window.localStorage.getItem(exerciseCountKey());
    return raw ? parseInt(raw, 10) || 0 : 0;
  }

  function incrementExerciseCount() {
    const next = getExerciseCount() + 1;
    window.localStorage.setItem(exerciseCountKey(), String(next));
    return next;
  }

  /**
   * Mostra o paywall de upgrade. Reaproveita o popup genérico já existente
   * no markup (#pop-ups / .pop-up) seria mais trabalho de mapear; em vez
   * disso criamos um overlay próprio, simples e desacoplado do DOM legado,
   * para não arriscar conflito com os popups de áudio/timer existentes.
   */
  function showPaywall(message) {
    let overlay = document.getElementById("demo-paywall-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "demo-paywall-overlay";
      overlay.innerHTML = `
        <div class="demo-paywall-card">
          <button type="button" class="demo-paywall-close" aria-label="Fechar">&times;</button>
          <div class="demo-paywall-lock">🔒</div>
          <h3 class="demo-paywall-title">Recurso da versão completa</h3>
          <p class="demo-paywall-text"></p>
          <a href="https://stamflow.com.br/#planos" class="demo-paywall-cta">
            Assinar agora
          </a>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.querySelector(".demo-paywall-close").addEventListener("click", () => {
        overlay.classList.remove("ativo");
      });
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("ativo");
      });
    }
    overlay.querySelector(".demo-paywall-text").textContent = message;
    overlay.classList.add("ativo");
  }

  /**
   * Chamar ANTES de tocar um áudio (qualquer categoria). Retorna true se
   * pode tocar, false se foi bloqueado (e já mostrou o paywall).
   */
  function canPlayCategory(categoria) {
    if (!_isDemoAccount) return true; // conta não-demo: sem limitação

    if (BLOCKED_CATEGORIES.has(categoria)) {
      const nomes = { mental: "Pausa Mental", foco: "Modo Foco", university: "StamFlow University" };
      showPaywall(
        `${nomes[categoria] || "Este recurso"} está disponível apenas para assinantes. ` +
        `Na demonstração gratuita, você pode experimentar a leitura de humor, postura e os exercícios guiados.`
      );
      return false;
    }

    if (categoria === "exercicio") {
      const used = getExerciseCount();
      if (used >= EXERCISE_LIMIT_TOTAL) {
        showPaywall(
          `Você já usou os ${EXERCISE_LIMIT_TOTAL} exercícios guiados disponíveis na demonstração. ` +
          `Assine para ter acesso ilimitado a todos os exercícios.`
        );
        return false;
      }
      incrementExerciseCount();
    }

    return true;
  }

  /**
   * Chamar ao clicar em um item de navegação do menu lateral. Retorna true
   * se a navegação deve prosseguir normalmente, false se foi bloqueada
   * (mostra o cadeado em vez de trocar de seção).
   */
  function canNavigateToSection(title) {
    if (!_isDemoAccount) return true;

    // "Insights & Analytics" é o title do item de Relatórios no menu
    // (ver app/_legacy/app-body.html). Bloqueado por completo no demo —
    // nem visualização parcial.
    if (title === "Insights & Analytics") {
      showPaywall(
        "Relatórios e histórico de energia ficam disponíveis a partir da assinatura. " +
        "Na demonstração, você acompanha sua energia em tempo real, mas o histórico fica trancado."
      );
      return false;
    }
    return true;
  }

  // Inicializa a consulta ao perfil assim que o módulo carrega (antes do
  // script.js rodar, pois este arquivo é carregado primeiro).
  const _readyPromise = fetchProfile();

  window.DemoGate = {
    ready: () => _readyPromise,
    isDemo: () => _isDemoAccount,
    canPlayCategory,
    canNavigateToSection,
    EXERCISE_LIMIT_TOTAL,
    getExerciseCount,
  };
})();
