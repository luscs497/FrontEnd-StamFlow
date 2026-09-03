/* =============================================================================
   modal-scroll-lock.js — trava a rolagem da página enquanto QUALQUER pop-up do
   painel estiver aberto (scroll bleed).

   Por que um arquivo próprio, e não um trecho no script.js: os pop-ups são
   abertos de dezenas de pontos diferentes — script.js, detox.js, camera.js,
   tickets.js e handlers inline no próprio HTML legado. Instrumentar cada
   abertura e cada fechamento significaria mexer em todos eles e, pior, deixar
   a trava dependente de ninguém esquecer o par. Aqui a decisão é observacional:
   olha-se o DOM e liga-se a trava quando algum pop-up está visível, venha ele
   de onde vier.

   Duas famílias de pop-up convivem no painel:
     - as do painel legado alternam `.display-none` (modal de Perfil, os
       `popup-embasamento`, o player de áudio, o alerta de bem-estar e o
       onboarding);
     - as do Detox alternam `.hidden` do Tailwind.
   ============================================================================= */
(function () {
  "use strict";

  var CLASSE = "modal-open";

  var SELETOR = [
    '[id$="Modal"]',            // os 8 do Detox
    ".modal-perfil",
    ".popup-embasamento",
    ".modal-audio",
    ".alerta-bem-estar-overlay",
    ".on-boarding"
  ].join(",");

  // As duas classes que escondem pop-up neste projeto.
  function escondidoPorClasse(no) {
    return no.classList.contains("hidden") || no.classList.contains("display-none");
  }

  /* -------------------------------------------------------------------------
     O4 — a lista de candidatos, em cache.

     `algumAberto()` refazia o `querySelectorAll` a cada quadro. O seletor tem
     seis partes e uma delas é `[id$="Modal"]`: casamento por SUFIXO de
     atributo, que nenhum índice do motor cobre, então percorre os ~1.584
     elementos da árvore. Como o camera.js escreve `className` em cerca de dez
     elementos por leitura do worker (~10x/s), essa varredura virou trabalho de
     caminho quente.

     O cache tem prazo curto de propósito: os pop-ups são markup estático, mas
     um TTL de 1s garante que qualquer inserção dinâmica futura seja vista sem
     precisar observar `childList` — o que colocaria este código no caminho do
     arraste de post-its do Detox, exatamente o que o comentário do observer
     abaixo evita.
  ------------------------------------------------------------------------- */
  var CACHE_TTL_MS = 1000;
  var candidatos = null;
  var candidatosEm = 0;

  function listaDeCandidatos() {
    var agora = Date.now();
    if (!candidatos || agora - candidatosEm > CACHE_TTL_MS) {
      candidatos = document.querySelectorAll(SELETOR);
      candidatosEm = agora;
    }
    return candidatos;
  }

  /* -------------------------------------------------------------------------
     O4 — `visivel()` sem forçar reflow.

     O `getClientRects()` de antes resolvia o problema certo (enxerga ancestral
     escondido, coisa que o getComputedStyle não faz) pelo preço errado: é
     reflow SÍNCRONO forçado, e rodava por candidato, por quadro. O
     `checkVisibility({checkVisibilityCSS: true})` responde exatamente a mesma
     pergunta — percorre a cadeia de ancestrais — sem obrigar o layout a ser
     recalculado. Onde ele não existe (Safari < 17.4), cai no comportamento
     anterior, que continua correto.
  ------------------------------------------------------------------------- */
  function visivel(no) {
    if (typeof no.checkVisibility === "function") {
      return no.checkVisibility({ checkVisibilityCSS: true });
    }
    return no.getClientRects().length > 0;
  }

  function algumAberto() {
    var nos = listaDeCandidatos();
    for (var i = 0; i < nos.length; i++) {
      // Teste barato primeiro: a classe.
      if (escondidoPorClasse(nos[i])) continue;
      if (visivel(nos[i])) return true;
    }
    return false;
  }

  /* -------------------------------------------------------------------------
     O4 — filtro de mutação.

     Só duas classes de mutação podem mudar a resposta de `algumAberto()`:
     a classe mudou NO PRÓPRIO pop-up (abriu/fechou), ou mudou em um ANCESTRAL
     dele (o `<section id="modais">` que envolve os `popup-embasamento`, por
     exemplo). Tudo o mais — e é a esmagadora maioria, porque o camera.js
     reescreve `className` nas barras de stamina e nos rótulos de postura ~10
     vezes por segundo — não pode alterar visibilidade de pop-up nenhum.

     Sem este filtro, cada uma dessas escritas agendava um quadro e pagava a
     varredura completa mais o reflow forçado.
  ------------------------------------------------------------------------- */
  function mutacaoRelevante(m) {
    var alvo = m.target;
    if (!alvo || alvo.nodeType !== 1) return false;
    if (alvo.matches && alvo.matches(SELETOR)) return true;
    var nos = listaDeCandidatos();
    for (var i = 0; i < nos.length; i++) {
      if (alvo.contains(nos[i])) return true;
    }
    return false;
  }

  var agendado = 0;

  function sincronizar() {
    agendado = 0;
    document.body.classList.toggle(CLASSE, algumAberto());
  }

  // Uma varredura por quadro, no máximo: um clique costuma disparar várias
  // mutações de classe seguidas, e todas levariam à mesma conclusão.
  function agendar() {
    if (agendado) return;
    agendado = requestAnimationFrame(sincronizar);
  }

  function iniciar() {
    if (!document.body || document.body.dataset.travaDeModal) return;
    document.body.dataset.travaDeModal = "1";

    sincronizar(); // o onboarding já nasce aberto

    // Só `class`: é por ela que os pop-us abrem e fecham. Observar `style`
    // junto colocaria este código no caminho quente do arraste de post-its,
    // que mexe em `style` a cada quadro.
    new MutationObserver(function (mutacoes) {
      for (var i = 0; i < mutacoes.length; i++) {
        if (mutacaoRelevante(mutacoes[i])) { agendar(); return; }
      }
    }).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
