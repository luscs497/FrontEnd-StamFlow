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

  function algumAberto() {
    var nos = document.querySelectorAll(SELETOR);
    for (var i = 0; i < nos.length; i++) {
      // Teste barato primeiro: a classe. Só o que passa por ele paga um
      // getComputedStyle, que força recálculo de estilo — e este código roda a
      // cada mudança de classe na árvore, inclusive durante o arraste de um
      // post-it do Detox.
      if (escondidoPorClasse(nos[i])) continue;
      // getComputedStyle NAO serve aqui: ele devolve o display do proprio
      // elemento, ignorando ancestral escondido. Os cinco `popup-embasamento`
      // e o modal de Perfil vivem dentro de <section id="modais">, que e o
      // overlay e tem o seu proprio `.display-none` — com um popup destravado
      // e o #modais ainda escondido, o computed dizia "flex" e a trava ligava
      // com nada na tela. Medido: computedDisplay "flex", getClientRects() 0.
      // getClientRects() ve a arvore inteira: zero retangulos = invisivel,
      // seja por qual ancestral for.
      if (nos[i].getClientRects().length > 0) return true;
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
    new MutationObserver(agendar).observe(document.body, {
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
