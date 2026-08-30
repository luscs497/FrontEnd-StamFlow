/*
 * Detox Mental (Brain Dump) — aba do painel.
 *
 * Origem: artefato gerado no Gemini Canvas, integrado ao painel com três
 * adaptações obrigatórias:
 *   1. IDs prefixados com `detox-` — os scripts legados do painel usam ids
 *      soltos (whiteboard, toast, infoModal...) e colidiriam.
 *   2. Tudo dentro de uma IIFE, exposto só como window.detoxMental. Os
 *      handlers inline do markup chamam detoxMental.funcao(...).
 *   3. O `window.onload` do original virou init() próprio: sobrescrever
 *      window.onload mataria handlers do painel, e o bootstrap legado
 *      re-dispara os eventos de carga.
 *
 * As classes de estilo continuam com nomes utilitários do Tailwind, mas o CSS
 * é gerado estaticamente e escopado em #detox-root (app/detox.css) — não há
 * Tailwind CDN nem Preflight, que quebrariam o CSS legado do painel.
 */
(function () {
  "use strict";

  // O painel pode re-disparar DOMContentLoaded/load: sem isto, os listeners de
  // drag em document seriam registrados de novo a cada boot.
  if (window.detoxMental) return;

  // CONFIGURAÇÕES DO ESQUEMA DE CORES (Baseados na identidade visual da StamFlow)
  // Por padrão o post-it surge azul (Tranquilidade)
  const colorSchemes = {
      azul: { bg: 'bg-[#f2f8fe]/95', border: 'border-[#cce3fc]', text: 'text-[#063c61]', accent: '#3b82f6', label: 'Azul' },
      verde: { bg: 'bg-[#f4fbf7]/95', border: 'border-[#c7ebd5]', text: 'text-[#0b4d2c]', accent: '#10b981', label: 'Verde' },
      laranja: { bg: 'bg-[#fffbf4]/95', border: 'border-[#fde6c7]', text: 'text-[#874a00]', accent: '#f59e0b', label: 'Laranja' },
      lilas: { bg: 'bg-[#faf6ff]/95', border: 'border-[#ebdbff]', text: 'text-[#3c0c78]', accent: '#8b5cf6', label: 'Lilás' }
  };

  // ESTADO GLOBAL DO APLICATIVO
  let notes = [];
  let selectedMood = null;
  let isMoodWidgetExpanded = true;
  let noteIdCounter = 1;
  let isProcessingDisintegration = false;

  // DRAG AND DROP AUXILIARES
  // Qual post-it estava em edição no instante em que o botão do mouse desceu.
  // Precisa ser capturado no mousedown, e não no click: o navegador tira o
  // foco do textarea durante o mousedown, então no click o activeElement já
  // seria o body e a informação estaria perdida.
  let notaEmEdicao = null;
  let activeDragNote = null;
  let dragOffset = { x: 0, y: 0 };
  // Fracao equivalente ao moodWidgetPos (ver bloco POSICAO DAS NOTAS).
  let moodWidgetFrac = { x: null, y: null };
  let activeDragWidget = null;
  let widgetOffset = { x: 0, y: 0 };
  let moodWidgetPos = { x: 0, y: 0 };
  let hasDraggedMood = false; // Controle de centralização inicial do primeiro acesso

  // CONFIGURAÇÕES DOS MODAIS
  // Abertura/fechamento imediatos, como o modal de Perfil. Os setTimeout de 10ms
  // (abrir) e 150ms (fechar) existiam para dar tempo da transição do scale-95
  // rodar; o R19#3 zerou esse transform, então o que sobrava era só atraso.
  // O scale-95 continua sendo tirado/reposto para não deixar a marcação num
  // estado inconsistente caso o CSS mude.
  function openModal(id) {
      const modal = document.getElementById(id);
      if (id === 'detox-howItWorksModal') montarAtalhosNoComoFunciona();
      modal.classList.remove('hidden');
      modal.querySelector('div').classList.remove('scale-95');
  }

  function closeModal(id) {
      const modal = document.getElementById(id);
      modal.querySelector('div').classList.add('scale-95');
      modal.classList.add('hidden');
  }

  // RETORNAR LEGENDA TRADUZIDA DOS MOODS (Fiel às novas legendas solicitadas)
  function getMoodLegend(emoji) {
      const legends = {
          '😫': 'Exausto',
          '🥹': 'Triste',
          '😠': 'Irritado',
          '😬': 'Tenso',
          '🤔': 'Pensativo',
          '😊': 'Calmo',
          '🤓': 'Focado',
          '🥰': 'Apaixonado',
          '😎': 'Confiante',
          '🤩': 'Inspirado'
      };
      return legends[emoji] || '';
  }

  // --------------------------------------------------------------------------
  // Mobile: os três atalhos do sub-header (O que descarregar / Método STOP /
  // Daily Wins) são CLONADOS para o topo do pop-up de Informações. CSS não
  // move nó no DOM, então os originais continuam no header e cada faixa decide
  // quem aparece — ver R19 no globals.css. O clone é feito uma única vez e os
  // onclick inline vêm junto no cloneNode, então continuam funcionando.
  // --------------------------------------------------------------------------
  // O destino é o pop-up "Como funciona o Detox Mental?" (detox-howItWorksModal).
  // Antes os clones iam para o "O que descarregar aqui?" (detox-infoModal), que
  // era o modal errado. A faixa entra DEPOIS do cabeçalho com o título, e não
  // logo após o botão de fechar, para não disputar espaço com o "X".
  const ID_MODAL_ATALHOS = "detox-howItWorksModal";

  function montarAtalhosNoComoFunciona() {
      const modal = document.getElementById(ID_MODAL_ATALHOS);
      if (!modal || modal.querySelector(".detox-atalhos-mobile")) return;
      const cartao = modal.querySelector("div");
      if (!cartao) return;

      const origem = document.querySelector("#detox-header .detox-acoes-rapidas");
      if (!origem) return;

      const faixa = document.createElement("div");
      faixa.className = "detox-atalhos-mobile";
      [...origem.children].forEach(function (btn) {
          if (btn.tagName !== "BUTTON") return;
          const c = btn.cloneNode(true);
          // Um atalho que reabrisse este mesmo modal não faz sentido aqui.
          if ((c.getAttribute("onclick") || "").includes(ID_MODAL_ATALHOS)) return;
          faixa.appendChild(c);
      });
      if (!faixa.children.length) return;

      // Âncora: o cabeçalho (ícone + título + linha divisória).
      const cabecalho = cartao.querySelector("div.border-b");
      if (cabecalho) cabecalho.insertAdjacentElement("afterend", faixa);
      else cartao.insertBefore(faixa, cartao.firstChild);
  }

  // --------------------------------------------------------------------------
  // Mobile: a barra inferior deixa de ter três botões soltos e vira UM botão
  // que abre um menu suspenso (dropup). Precisa de JS porque os três botões
  // são irmãos diretos do rodapé — sem um contêiner em volta não há como
  // posicioná-los como menu só com CSS. O envelope é criado uma vez; em
  // desktop o CSS devolve o contêiner ao fluxo normal e o gatilho some, então
  // a mesma marcação serve às duas faixas.
  // --------------------------------------------------------------------------
  function montarMenuAcoesRodape() {
      const rodape = document.getElementById("detox-footer");
      if (!rodape || rodape.querySelector(".detox-acoes-menu")) return;

      const botoes = [...rodape.querySelectorAll(":scope > .detox-btn-expansivel")];
      if (!botoes.length) return;

      const menu = document.createElement("div");
      menu.className = "detox-acoes-menu";
      botoes.forEach(function (b) { menu.appendChild(b); });

      const gatilho = document.createElement("button");
      gatilho.type = "button";
      gatilho.className = "detox-acoes-gatilho";
      gatilho.setAttribute("aria-expanded", "false");
      gatilho.setAttribute("aria-haspopup", "true");
      gatilho.setAttribute("aria-label", "Ações do quadro");
      gatilho.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<line x1="12" y1="5" x2="12" y2="19"></line>' +
        '<line x1="5" y1="12" x2="19" y2="12"></line></svg>' +
        '<span>Ações do quadro</span>';

      gatilho.addEventListener("click", function (e) {
          e.stopPropagation();
          const aberto = rodape.classList.toggle("detox-acoes-abertas");
          gatilho.setAttribute("aria-expanded", aberto ? "true" : "false");
      });

      // Clique fora e Escape fecham, como qualquer menu do painel.
      document.addEventListener("click", function (e) {
          if (!rodape.classList.contains("detox-acoes-abertas")) return;
          if (e.target.closest(".detox-acoes-menu, .detox-acoes-gatilho")) return;
          rodape.classList.remove("detox-acoes-abertas");
          gatilho.setAttribute("aria-expanded", "false");
      });
      document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && rodape.classList.contains("detox-acoes-abertas")) {
              rodape.classList.remove("detox-acoes-abertas");
              gatilho.setAttribute("aria-expanded", "false");
          }
      });

      // Escolher uma ação fecha o menu.
      menu.addEventListener("click", function (e) {
          if (!e.target.closest(".detox-btn-expansivel")) return;
          rodape.classList.remove("detox-acoes-abertas");
          gatilho.setAttribute("aria-expanded", "false");
      });

      rodape.appendChild(menu);
      rodape.appendChild(gatilho);
  }

  // TOGGLE PARA EXPANDIR / MINIMIZAR WIDGET DE HUMOR
  function toggleMoodWidget(expanded, event) {
      if (event) event.stopPropagation();
      isMoodWidgetExpanded = expanded;
      renderMoodWidget();
  }

  // SELETOR DE HUMOR
  function selectMood(emoji, event) {
      if (event) event.stopPropagation();

      if (selectedMood === emoji) {
          selectedMood = null;
          showToast("Humor limpo", "✨");
      } else {
          selectedMood = emoji;
          showToast(`Humor definido: ${getMoodLegend(emoji)} ${emoji}`, "💭");
          // Escolheu um humor => o card se recolhe sozinho, reaproveitando a
          // mesma via do "X" (toggleMoodWidget(false)). Só no caso de DEFINIR:
          // ao LIMPAR (clicar de novo na mesma emoção) o card fica aberto, senão
          // quem quis trocar de humor teria de reabrir a cada tentativa.
          isMoodWidgetExpanded = false;
      }
      renderMoodWidget();
  }

  // GERAR HTML DOS MOODS NO PAINEL (Sem animação pulse)
  function getMoodsHTML() {
      const emojis = ['😫', '🥹', '😠', '😬', '🤔', '😊', '🤓', '🥰', '😎', '🤩'];
      return emojis.map(emoji => {
          const isActive = selectedMood === emoji;
          const activeClass = isActive ? 'bg-indigo-600/35 border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-800/80 border-transparent';
          return `
              <button onclick="detoxMental.selectMood('${emoji}', event)" 
                      class="mood-btn text-2xl p-2 rounded-xl border transition-all duration-150 transform hover:scale-110 focus:outline-none ${activeClass}" 
                      title="${getMoodLegend(emoji)}">
                  ${emoji}
              </button>
          `;
      }).join('');
  }

  // RENDERIZAR PAINEL DE HUMOR DINAMICAMENTE (Centralizado no início até sofrer drag)
  function renderMoodWidget() {
      const container = document.getElementById('detox-moodWidgetContainer');
      if (!container) return;

      // Se o usuário já moveu o widget manualmente, use as coordenadas absolutas salvas
      if (hasDraggedMood) {
          container.classList.remove('left-1/2', 'top-1/2', '-translate-x-1/2', '-translate-y-1/2');
          // Mesma normalizacao das notas: em % da area util, nao em px.
          if (typeof moodWidgetFrac.x === 'number') {
              aplicarPosicao(container, moodWidgetFrac.x, moodWidgetFrac.y);
          } else {
              container.style.left = `${moodWidgetPos.x}px`;
              container.style.top = `${moodWidgetPos.y}px`;
          }
      } else {
          // Caso contrário, centralize via classes Tailwind
          container.classList.add('left-1/2', 'top-1/2', '-translate-x-1/2', '-translate-y-1/2');
          container.style.left = '';
          container.style.top = '';
      }

      if (isMoodWidgetExpanded) {
          container.className = "absolute bg-[#12111f] border border-slate-800/80 p-5 rounded-3xl shadow-2xl z-20 flex flex-col items-center gap-3 text-center w-[320px] pointer-events-auto select-none hover:border-slate-700/80 transition-all duration-150 " + (hasDraggedMood ? "" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2");
          container.innerHTML = `
              <!-- Close button in top-right -->
              <button onclick="detoxMental.toggleMoodWidget(false, event)" class="absolute top-3.5 right-3.5 text-slate-400 hover:text-white transition-colors focus:outline-none" title="Minimizar">
                  <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>

              <!-- Drag Handle -->
              <div class="w-10 h-1 bg-slate-800 hover:bg-slate-700 rounded-full mb-1 cursor-grab active:cursor-grabbing transition-colors" id="detox-moodDragHandle" title="Arraste para reposicionar"></div>

              <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Seu Estado Atual</p>
              <p class="text-xs text-slate-300 font-medium leading-relaxed px-2">Se desejar, selecione um mood que represente seu estado de humor atual</p>

              <!-- Grid of Emojis -->
              <div class="grid grid-cols-5 gap-2 mt-2 w-full">
                  ${getMoodsHTML()}
              </div>

              ${selectedMood ? `
                  <div class="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-xl font-semibold mt-2.5 w-full flex items-center justify-center gap-2">
                      <span class="text-base">${selectedMood}</span>
                      <span>Humor: ${getMoodLegend(selectedMood)}</span>
                  </div>
              ` : ''}
          `;
      } else {
          // Estado Minimizado (Sem animações piscantes ou distrativas)
          container.className = "absolute z-20 pointer-events-auto select-none transition-all " + (hasDraggedMood ? "" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2");
          if (selectedMood) {
              container.innerHTML = `
                  <div class="flex items-center gap-3 px-4 py-2.5 bg-[#12111f]/95 hover:bg-[#12111f] border border-indigo-500/30 text-white rounded-2xl shadow-xl hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing group" id="detox-moodDragHandle">
                      <span class="text-3xl">${selectedMood}</span>
                      <div class="flex flex-col items-start leading-none pr-1">
                          <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Humor Atual</span>
                          <span class="text-xs font-semibold text-indigo-300 mt-1">${getMoodLegend(selectedMood)}</span>
                      </div>
                      <button onclick="detoxMental.toggleMoodWidget(true, event)" class="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all ml-1 focus:outline-none" title="Mudar humor / Expandir">
                          <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                      </button>
                  </div>
              `;
          } else {
              // Ícone discreto escrito "Mood" para reabrir
              container.innerHTML = `
                  <button onclick="detoxMental.toggleMoodWidget(true, event)" class="flex items-center gap-2 px-4 py-2.5 bg-[#12111f]/95 hover:bg-[#12111f] border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white rounded-2xl shadow-lg text-xs font-semibold transition-all cursor-grab active:cursor-grabbing" id="detox-moodDragHandle">
                      <span class="text-indigo-400">✨</span>
                      <span>Mood</span>
                  </button>
              `;
          }
      }

      // Vincular drag listeners para o Widget recém-renderizado
      setupMoodWidgetDragging();
  }

  function setupMoodWidgetDragging() {
      const widget = document.getElementById('detox-moodWidgetContainer');
      if (!widget) return;

      // renderMoodWidget() troca só o innerHTML e chama esta função de novo; o
      // widget em si persiste, então sem o guard os listeners se acumulariam.
      if (widget.dataset.detoxArrasteLigado) return;
      widget.dataset.detoxArrasteLigado = "1";

      // O card arrasta por qualquer ponto, como os post-its — antes só a
      // barrinha de 40x4px pegava, o que tornava o movimento difícil.
      // Emojis e botões seguem clicáveis.
      function podeArrastar(alvo) {
          return !alvo.closest('button');
      }

      // Enquanto o widget está centralizado por classe (left-1/2 + translate),
      // escrever style.left/top deixaria o translate de -50% em vigor e o card
      // saltaria no primeiro arraste. Fixamos a posição atual em pixels antes.
      function fixarPosicaoAtual() {
          const board = document.getElementById('detox-whiteboard');
          if (!board) return;
          const rect = widget.getBoundingClientRect();
          const boardRect = board.getBoundingClientRect();
          widget.classList.remove('left-1/2', 'top-1/2', '-translate-x-1/2', '-translate-y-1/2');
          widget.style.left = `${rect.left - boardRect.left}px`;
          widget.style.top = `${rect.top - boardRect.top}px`;
          moodWidgetPos.x = rect.left - boardRect.left;
          moodWidgetPos.y = rect.top - boardRect.top;
          moodWidgetFrac.x = pxParaFracao(moodWidgetPos.x, boardRect.width, widget.offsetWidth);
          moodWidgetFrac.y = pxParaFracao(moodWidgetPos.y, boardRect.height, widget.offsetHeight);
      }

      widget.addEventListener('mousedown', function(e) {
          if (!podeArrastar(e.target)) return;
          fixarPosicaoAtual();
          activeDragWidget = widget;
          const rect = widget.getBoundingClientRect();
          widgetOffset.x = e.clientX - rect.left;
          widgetOffset.y = e.clientY - rect.top;
          hasDraggedMood = true; // Usuário decidiu arrastar
      });

      widget.addEventListener('touchstart', function(e) {
          if (!podeArrastar(e.target)) return;
          fixarPosicaoAtual();
          activeDragWidget = widget;
          const rect = widget.getBoundingClientRect();
          const touch = e.touches[0];
          widgetOffset.x = touch.clientX - rect.left;
          widgetOffset.y = touch.clientY - rect.top;
          hasDraggedMood = true;
      }, { passive: true });
  }

  // GESTÃO DE CLIQUES E CRIAÇÃO DE NOTAS
  function handleWhiteboardClick(e) {
      // Se clicar nos modais, no seletor de cores, ou seletor de humor, ignorar
      if (e.target.closest('#detox-moodWidgetContainer') || e.target.closest('.note-bubble') || e.target.closest('.color-picker-dropdown') || isProcessingDisintegration) {
          return;
      }

      // Escrevendo num post-it, o clique no quadro vale como "fechar este":
      // ele só tira o foco, e não cria nada. O post-it novo nasce no clique
      // seguinte, já sem nada selecionado. Botões continuam com a vez —
      // header, rodapé e widget de humor nem chegam aqui, e o que está dentro
      // da nota já saiu nas guardas acima.
      if (notaEmEdicao) {
          notaEmEdicao.blur();
          notaEmEdicao = null;
          return;
      }

      // Pegar coordenadas relativas ao container de notas
      const rect = document.getElementById('detox-whiteboard').getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Evitar criar notas muito coladas nas bordas
      const adjustedX = Math.max(20, Math.min(x - 120, rect.width - 260));
      const adjustedY = Math.max(20, Math.min(y - 50, rect.height - 150));

      createNoteElement(adjustedX, adjustedY);
  }

  // Alternar visualização do seletor de cor individual de um post-it
  function toggleColorPicker(id, event) {
      event.stopPropagation();
      const picker = document.getElementById(`detox-color-picker-${id}`);
      if (picker) {
          const isHidden = picker.classList.contains('hidden');
          // Fechar todos os outros abertos antes
          document.querySelectorAll('.color-picker-dropdown').forEach(el => el.classList.add('hidden'));
          if (isHidden) {
              picker.classList.remove('hidden');
          }
      }
  }

  // Alterar cor de um post-it de forma dinâmica
  function selectNoteColor(id, colorName, event) {
      event.stopPropagation();
      const note = notes.find(n => n.id === id);
      if (note) {
          const oldScheme = colorSchemes[note.colorName];
          const newScheme = colorSchemes[colorName];
          note.colorName = colorName;

          const noteElement = document.getElementById(`detox-note-${id}`);
          if (noteElement) {
              // Remover classes antigas
              noteElement.classList.remove(oldScheme.bg, oldScheme.border);
              // Adicionar novas
              noteElement.classList.add(newScheme.bg, newScheme.border);

              // Atualizar classes de texto do textarea
              const textarea = noteElement.querySelector('textarea');
              textarea.classList.remove(oldScheme.text);
              textarea.classList.add(newScheme.text);
          }
      }
      // Fechar o picker
      const picker = document.getElementById(`detox-color-picker-${id}`);
      if (picker) picker.classList.add('hidden');
  }


  // ==========================================================================
  // POSICAO DAS NOTAS — normalizada, nao em pixels
  //
  // Antes, a posicao de cada post-it era gravada em pixels (style.left = "800px"
  // e notes[].x = 800). Como o quadro e fluido e nao havia NENHUM handler de
  // resize, uma nota criada a 1200px continuava a 800px de offset quando a tela
  // virava 360px: ela caia fora do quadro e o overflow:hidden a escondia de vez,
  // sem jeito de recuperar.
  //
  // A fracao NAO e `x / larguraDoQuadro`, e sim `x / (larguraDoQuadro -
  // larguraDaNota)`: o post-it tem largura fixa (240px), entao normalizar pela
  // largura do quadro deixaria uma nota em 90% comecando a 310px num quadro de
  // 345px — 240px de nota estourando de novo. Normalizando pela AREA UTIL,
  // 0 = encostada na esquerda e 1 = encostada na direita, em qualquer largura.
  //
  // O CSS sai em %, convertido a partir da fracao no momento de aplicar, e um
  // ResizeObserver reaplica em todo resize do quadro.
  // ==========================================================================
  function medidasQuadro() {
      const board = document.getElementById('detox-whiteboard');
      if (!board) return null;
      const r = board.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return null;
      return { w: r.width, h: r.height };
  }

  function pxParaFracao(px, tamanhoQuadro, tamanhoElemento) {
      const util = tamanhoQuadro - tamanhoElemento;
      if (util <= 0) return 0;
      return Math.min(1, Math.max(0, px / util));
  }

  function fracaoParaPct(fracao, tamanhoQuadro, tamanhoElemento) {
      if (tamanhoQuadro <= 0) return 0;
      const util = Math.max(0, tamanhoQuadro - tamanhoElemento);
      return ((fracao * util) / tamanhoQuadro) * 100;
  }

  function aplicarPosicao(elm, fx, fy) {
      const q = medidasQuadro();
      if (!q || !elm) return;
      elm.style.left = fracaoParaPct(fx, q.w, elm.offsetWidth) + '%';
      elm.style.top = fracaoParaPct(fy, q.h, elm.offsetHeight) + '%';
  }

  function guardarFracao(note, elm, xPx, yPx) {
      const q = medidasQuadro();
      if (!q || !note || !elm) return;
      note.fx = pxParaFracao(xPx, q.w, elm.offsetWidth);
      note.fy = pxParaFracao(yPx, q.h, elm.offsetHeight);
      note.x = xPx;
      note.y = yPx;
  }

  // Reancora tudo que vive no quadro sempre que ele muda de tamanho.
  function reposicionarQuadro() {
      notes.forEach(function (n) {
          const el = document.getElementById('detox-note-' + n.id);
          if (el && typeof n.fx === 'number') aplicarPosicao(el, n.fx, n.fy);
      });
      if (hasDraggedMood && typeof moodWidgetFrac.x === 'number') {
          const w = document.getElementById('detox-moodWidgetContainer');
          if (w) aplicarPosicao(w, moodWidgetFrac.x, moodWidgetFrac.y);
      }
  }

  function observarQuadro() {
      const board = document.getElementById('detox-whiteboard');
      if (!board || board.__detoxObservado) return;
      board.__detoxObservado = true;
      if (typeof ResizeObserver === 'function') {
          new ResizeObserver(function () { reposicionarQuadro(); }).observe(board);
      } else {
          window.addEventListener('resize', reposicionarQuadro);
      }
  }

  function createNoteElement(x, y, text = '', colorName = 'azul') {
      const id = noteIdCounter++;
      const container = document.getElementById('detox-notesContainer');
      const scheme = colorSchemes[colorName];

      // Criar container da nota
      const noteDiv = document.createElement('div');
      noteDiv.id = `detox-note-${id}`;
      noteDiv.style.left = `${x}px`;
      noteDiv.style.top = `${y}px`;
      noteDiv.className = `absolute note-bubble w-[240px] ${scheme.bg} ${scheme.border} border-2 rounded-2xl p-3 pointer-events-auto flex flex-col gap-1 cursor-grab active:cursor-grabbing select-none group`;

      // HTML Interno da Nota (Com o Lápis Interativo de Troca de Cores)
      noteDiv.innerHTML = `
          <div class="flex items-center justify-between shrink-0 mb-1">
              <!-- BOTÃO DO LÁPIS INTERATIVO PARA SELEÇÃO DE COR -->
              <div class="relative pointer-events-auto">
                  <button onclick="detoxMental.toggleColorPicker(${id}, event)" class="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-200/50 rounded-lg focus:outline-none" title="Trocar a cor desta nota">
                      <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                  </button>

                  <!-- Dropdown do Seletor de Cores -->
                  <div id="detox-color-picker-${id}" class="color-picker-dropdown hidden absolute top-7 left-0 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-1.5 shadow-lg flex gap-1.5 z-40">
                      <button onclick="detoxMental.selectNoteColor(${id}, 'azul', event)" class="w-5 h-5 rounded-full bg-[#f2f8fe] border-2 border-[#cce3fc] hover:scale-110 transition-transform focus:outline-none" title="Azul StamFlow"></button>
                      <button onclick="detoxMental.selectNoteColor(${id}, 'verde', event)" class="w-5 h-5 rounded-full bg-[#f4fbf7] border-2 border-[#c7ebd5] hover:scale-110 transition-transform focus:outline-none" title="Verde"></button>
                      <button onclick="detoxMental.selectNoteColor(${id}, 'laranja', event)" class="w-5 h-5 rounded-full bg-[#fffbf4] border-2 border-[#fde6c7] hover:scale-110 transition-transform focus:outline-none" title="Laranja"></button>
                      <button onclick="detoxMental.selectNoteColor(${id}, 'lilas', event)" class="w-5 h-5 rounded-full bg-[#faf6ff] border-2 border-[#ebdbff] hover:scale-110 transition-transform focus:outline-none" title="Lilás"></button>
                  </div>
              </div>

              <button onclick="detoxMental.deleteNote(${id}, event)" class="pointer-events-auto opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-rose-600 transition-all focus:outline-none" title="Remover esta nota">
                  <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
              </button>
          </div>
          <textarea 
              oninput="detoxMental.updateNoteText(${id}, this)"
              onfocus="activeDragNote = null"
              placeholder="Digitar pensamento..."
              class="w-full ${scheme.text} placeholder-slate-400 bg-transparent border-none p-0 resize-none focus:ring-0 text-xs md:text-sm leading-relaxed overflow-y-auto max-h-[140px] focus:outline-none font-medium"
              style="height: 60px;"
          >${text}</textarea>
      `;

      container.appendChild(noteDiv);

      // Adicionar ao array de controle do estado. A posicao entra normalizada
      // (fx/fy) e o CSS e reescrito em % — os px acima servem so para o
      // elemento ja existir com tamanho medivel aqui.
      const registro = {
          id: id,
          x: x,
          y: y,
          fx: 0,
          fy: 0,
          text: text,
          colorName: colorName
      };
      notes.push(registro);
      guardarFracao(registro, noteDiv, x, y);
      aplicarPosicao(noteDiv, registro.fx, registro.fy);
      observarQuadro();

      atualizarBadges();

      // Auto-focus no textarea gerado
      const textarea = noteDiv.querySelector('textarea');
      textarea.focus();

      // Forçar auto-height conforme o usuário digita
      textarea.addEventListener('input', function() {
          this.style.height = 'auto';
          this.style.height = (this.scrollHeight) + 'px';
      });

      // Configurar Arrastar e Soltar (Drag & Drop)
      setupNoteDragging(noteDiv, id);
  }

  // ATUALIZAÇÃO DE TEXTO NO ESTADO
  function updateNoteText(id, textarea) {
      const note = notes.find(n => n.id === id);
      if (note) {
          note.text = textarea.value;
          atualizarBadges();
      }
  }

  // APAGAR NOTA ESPECÍFICA
  function deleteNote(id, event) {
      event.stopPropagation();
      notes = notes.filter(n => n.id !== id);
      atualizarBadges();
      const noteElement = document.getElementById(`detox-note-${id}`);
      if (noteElement) {
          noteElement.classList.add('scale-75', 'opacity-0');
          setTimeout(() => {
              noteElement.remove();
          }, 150);
      }
  }

  // DRAG AND DROP DE NOTAS
  function setupNoteDragging(elm, id) {
      elm.addEventListener('mousedown', function(e) {
          if (e.target.tagName === 'TEXTAREA' || e.target.closest('button') || e.target.closest('.color-picker-dropdown')) return;
          activeDragNote = elm;
          const rect = elm.getBoundingClientRect();
          dragOffset.x = e.clientX - rect.left;
          dragOffset.y = e.clientY - rect.top;

          elm.classList.remove('cursor-grab');
          elm.classList.add('cursor-grabbing');
      });

      elm.addEventListener('touchstart', function(e) {
          if (e.target.tagName === 'TEXTAREA' || e.target.closest('button') || e.target.closest('.color-picker-dropdown')) return;
          activeDragNote = elm;
          const rect = elm.getBoundingClientRect();
          const touch = e.touches[0];
          dragOffset.x = touch.clientX - rect.left;
          dragOffset.y = touch.clientY - rect.top;
      }, { passive: true });
  }

  // ATUALIZAR ARRASTE GLOBAL EM REAL TIME (Suporta arrastar notas e o widget)
  document.addEventListener('mousemove', function(e) {
      if (activeDragNote) {
          const boardRect = document.getElementById('detox-whiteboard').getBoundingClientRect();
          let x = e.clientX - boardRect.left - dragOffset.x;
          let y = e.clientY - boardRect.top - dragOffset.y;

          x = Math.max(0, Math.min(x, boardRect.width - activeDragNote.offsetWidth));
          y = Math.max(0, Math.min(y, boardRect.height - activeDragNote.offsetHeight));

          activeDragNote.style.left = `${(x / boardRect.width) * 100}%`;
          activeDragNote.style.top = `${(y / boardRect.height) * 100}%`;

          // O id do elemento e "detox-note-<n>": trocar so "note-" deixava
          // "detox-<n>", que vira NaN no parseInt — o estado NUNCA era
          // atualizado ao arrastar com o mouse. Agora lemos o sufixo numerico.
          const noteId = parseInt(activeDragNote.id.replace('detox-note-', ''), 10);
          const note = notes.find(n => n.id === noteId);
          if (note) {
              guardarFracao(note, activeDragNote, x, y);
          }
      }

      if (activeDragWidget) {
          const boardRect = document.getElementById('detox-whiteboard').getBoundingClientRect();
          let x = e.clientX - boardRect.left - widgetOffset.x;
          let y = e.clientY - boardRect.top - widgetOffset.y;

          x = Math.max(0, Math.min(x, boardRect.width - activeDragWidget.offsetWidth));
          y = Math.max(0, Math.min(y, boardRect.height - activeDragWidget.offsetHeight));

          activeDragWidget.style.left = `${(x / boardRect.width) * 100}%`;
          activeDragWidget.style.top = `${(y / boardRect.height) * 100}%`;

          moodWidgetPos.x = x;
          moodWidgetPos.y = y;
          moodWidgetFrac.x = pxParaFracao(x, boardRect.width, activeDragWidget.offsetWidth);
          moodWidgetFrac.y = pxParaFracao(y, boardRect.height, activeDragWidget.offsetHeight);
      }
  });

  document.addEventListener('touchmove', function(e) {
      if (activeDragNote) {
          const boardRect = document.getElementById('detox-whiteboard').getBoundingClientRect();
          const touch = e.touches[0];
          let x = touch.clientX - boardRect.left - dragOffset.x;
          let y = touch.clientY - boardRect.top - dragOffset.y;

          x = Math.max(0, Math.min(x, boardRect.width - activeDragNote.offsetWidth));
          y = Math.max(0, Math.min(y, boardRect.height - activeDragNote.offsetHeight));

          activeDragNote.style.left = `${(x / boardRect.width) * 100}%`;
          activeDragNote.style.top = `${(y / boardRect.height) * 100}%`;

          // O toque tambem precisa gravar no estado; antes so o mouse tentava
          // (e falhava no parseInt).
          const noteId = parseInt(activeDragNote.id.replace('detox-note-', ''), 10);
          const note = notes.find(n => n.id === noteId);
          if (note) {
              guardarFracao(note, activeDragNote, x, y);
          }
      }

      if (activeDragWidget) {
          const boardRect = document.getElementById('detox-whiteboard').getBoundingClientRect();
          const touch = e.touches[0];
          let x = touch.clientX - boardRect.left - widgetOffset.x;
          let y = touch.clientY - boardRect.top - widgetOffset.y;

          x = Math.max(0, Math.min(x, boardRect.width - activeDragWidget.offsetWidth));
          y = Math.max(0, Math.min(y, boardRect.height - activeDragWidget.offsetHeight));

          activeDragWidget.style.left = `${(x / boardRect.width) * 100}%`;
          activeDragWidget.style.top = `${(y / boardRect.height) * 100}%`;

          moodWidgetPos.x = x;
          moodWidgetPos.y = y;
          moodWidgetFrac.x = pxParaFracao(x, boardRect.width, activeDragWidget.offsetWidth);
          moodWidgetFrac.y = pxParaFracao(y, boardRect.height, activeDragWidget.offsetHeight);
      }
  }, { passive: true });

  document.addEventListener('mouseup', function() {
      if (activeDragNote) {
          activeDragNote.classList.remove('cursor-grabbing');
          activeDragNote.classList.add('cursor-grab');
          activeDragNote = null;
      }
      activeDragWidget = null;
  });

  document.addEventListener('touchend', function() {
      activeDragNote = null;
      activeDragWidget = null;
  });

  // Fechar seletores de cor se o usuário clicar fora deles no quadro
  document.addEventListener('click', function(e) {
      if (!e.target.closest('.color-picker-dropdown') && !e.target.closest('.pointer-events-auto')) {
          document.querySelectorAll('.color-picker-dropdown').forEach(el => el.classList.add('hidden'));
      }
  });

  // TOAST NOTIFICATIONS
  function showToast(message, icon = "⚡") {
      const toast = document.getElementById('detox-toast');
      document.getElementById('detox-toastIcon').textContent = icon;
      document.getElementById('detox-toastMessage').textContent = message;

      toast.classList.remove('opacity-0', 'pointer-events-none');
      toast.classList.add('opacity-100');

      setTimeout(() => {
          toast.classList.remove('opacity-100');
          toast.classList.add('opacity-0', 'pointer-events-none');
      }, 3000);
  }

  function openDownloadModal() {
      if (notes.length === 0 && !selectedMood) {
          showToast("O quadro está vazio. Despeje pensamentos antes de salvar.", "💡");
          return;
      }
      openModal('detox-downloadModal');
  }

  function triggerDownload(format) {
      closeModal('detox-downloadModal');
      showToast("Preparando download...", "💾");

      if (format === 'png') {
          exportToPNG();
      } else if (format === 'pdf') {
          exportToPDF();
      } else if (format === 'docx') {
          exportToDOC();
      }
  }

  // Exportar como PNG
  function exportToPNG() {
      const element = document.getElementById('detox-whiteboard');
      // Esconder seletores e botões de fechar temporariamente para o print
      const closeButtons = element.querySelectorAll('.group-hover\\:opacity-100');
      const colorPickers = element.querySelectorAll('.color-picker-dropdown');
      closeButtons.forEach(btn => btn.style.display = 'none');
      colorPickers.forEach(cp => cp.style.display = 'none');

      html2canvas(element, {
          backgroundColor: '#fcfcfd',
          scale: 2
      }).then(canvas => {
          closeButtons.forEach(btn => btn.style.display = '');
          colorPickers.forEach(cp => cp.style.display = '');

          const link = document.createElement('a');
          link.download = `Detox_Mental_${new Date().toISOString().split('T')[0]}.png`;
          link.href = canvas.toDataURL();
          link.click();

          promptEliminateAfterDownload();
      }).catch(err => {
          showToast("Erro ao gerar imagem.", "❌");
          console.error(err);
      });
  }

  // Exportar como PDF
  function exportToPDF() {
      const element = document.getElementById('detox-whiteboard');
      const closeButtons = element.querySelectorAll('.group-hover\\:opacity-100');
      const colorPickers = element.querySelectorAll('.color-picker-dropdown');
      closeButtons.forEach(btn => btn.style.display = 'none');
      colorPickers.forEach(cp => cp.style.display = 'none');

      html2canvas(element, {
          backgroundColor: '#fcfcfd',
          scale: 1.5
      }).then(canvas => {
          closeButtons.forEach(btn => btn.style.display = '');
          colorPickers.forEach(cp => cp.style.display = '');

          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);

          pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, canvas.width, canvas.height);
          pdf.save(`Detox_Mental_${new Date().toISOString().split('T')[0]}.pdf`);

          promptEliminateAfterDownload();
      }).catch(err => {
          showToast("Erro ao gerar PDF.", "❌");
          console.error(err);
      });
  }

  // Exportar como DOC (HTML formatado compatível com MS Word)
  function exportToDOC() {
      let docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
          <title>Detox Mental - Relatório de Brain Dump</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333333; }
              h1 { color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; }
              .meta { color: #6B7280; font-size: 12px; margin-bottom: 30px; }
              .mood-badge { background-color: #EEF2F6; padding: 10px; border-radius: 8px; margin-bottom: 25px; display: inline-block; }
              .note { background-color: #F9FAFB; border-left: 4px solid #818CF8; padding: 15px; margin-bottom: 15px; border-radius: 4px; }
              .footer { font-size: 11px; color: #9CA3AF; margin-top: 50px; text-align: center; }
          </style>
      </head>
      <body>
          <h1>Detox Mental: Brain Dump</h1>
          <div class="meta">Exportado em: ${new Date().toLocaleString('pt-BR')}</div>
      `;

      if (selectedMood) {
          docContent += `<div class="mood-badge"><strong>Estado de Humor Selecionado:</strong> ${selectedMood} (${getMoodLegend(selectedMood)})</div>`;
      }

      docContent += `<h2>Seus Pensamentos Descarregados:</h2>`;

      const validNotes = notes.filter(n => n.text.trim() !== "");
      if (validNotes.length === 0) {
          docContent += `<p>Nenhum texto anotado.</p>`;
      } else {
          validNotes.forEach((note, idx) => {
              const schemeLabel = colorSchemes[note.colorName]?.label || 'Azul';
              docContent += `
                  <div class="note" style="border-left-color: ${colorSchemes[note.colorName]?.accent || '#3b82f6'};">
                      <strong>Pensamento #${idx + 1} (${schemeLabel}):</strong><br/>
                      ${note.text.replace(/\n/g, '<br/>')}
                  </div>
              `;
          });
      }

      docContent += `
          <div class="footer">Gerado localmente e seguro pelo sistema Detox Mental. Seus pensamentos já foram ou serão liberados.</div>
      </body>
      </html>
      `;

      const blob = new Blob(['\ufeff' + docContent], {
          type: 'application/msword'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Detox_Mental_${new Date().toISOString().split('T')[0]}.doc`;
      a.click();
      URL.revokeObjectURL(url);

      promptEliminateAfterDownload();
  }

  // --------------------------------------------------------------------------
  // Importar pensamentos de uma sessão anterior.
  //
  // Só o .doc dá para ler de volta: PNG e PDF são imagem, e o .doc que o
  // exportToDOC gera é HTML por dentro (é assim que o Word o abre). Então o
  // parse é o inverso exato da exportação — cada `.note` daquele arquivo vira
  // um post-it de novo, com a mesma cor e o mesmo texto.
  //
  // Nada disso sai do navegador: o arquivo é lido com FileReader, igual ao
  // resto da aba.
  // --------------------------------------------------------------------------
  const COR_POR_ROTULO = (function () {
    const mapa = {};
    Object.keys(colorSchemes).forEach(function (nome) {
      mapa[colorSchemes[nome].label.toLowerCase()] = nome;
    });
    return mapa;
  })();

  function abrirImportador() {
    const campo = el("detox-importInput");
    if (campo) campo.click();
  }

  function importarArquivo(campo) {
    const arquivo = campo && campo.files && campo.files[0];
    if (!arquivo) return;

    // PNG e PDF saem do html2canvas: são uma foto do quadro, sem camada de
    // texto, então não há o que ler de volta. Só o .doc volta, porque apesar
    // do nome ele é HTML e guarda cada pensamento como texto estruturado.
    if (/\.(pdf|png|jpe?g|webp)$/i.test(arquivo.name || "")) {
      showToast("PNG e PDF são imagem do quadro. Reimporte pelo arquivo .doc.", "💡");
      campo.value = "";
      return;
    }

    const leitor = new FileReader();
    leitor.onerror = function () {
      showToast("Não consegui ler esse arquivo.", "⚠️");
      campo.value = "";
    };
    leitor.onload = function () {
      try {
        aplicarImportacao(String(leitor.result || ""));
      } catch (erro) {
        showToast("Arquivo não reconhecido. Use o .doc exportado daqui.", "⚠️");
      }
      // zera para o mesmo arquivo poder ser escolhido de novo em seguida
      campo.value = "";
    };
    leitor.readAsText(arquivo);
  }

  function aplicarImportacao(conteudo) {
    const doc = new DOMParser().parseFromString(conteudo, "text/html");
    const blocos = doc.querySelectorAll(".note");

    if (!blocos.length) {
      showToast("Nenhum pensamento encontrado nesse arquivo.", "💡");
      return;
    }

    const quadro = el("detox-whiteboard");
    const area = quadro ? quadro.getBoundingClientRect() : { width: 960, height: 600 };
    const LARGURA = 264;  // 240px do post-it + respiro
    const ALTURA = 172;
    const colunas = Math.max(1, Math.floor((area.width - 24) / LARGURA));

    let importados = 0;
    blocos.forEach(function (bloco) {
      // <strong>Pensamento #N (Cor):</strong> abre o bloco; o texto é o resto
      const marcador = bloco.querySelector("strong");
      const rotuloCor = marcador ? (marcador.textContent.match(/\(([^)]+)\)/) || [])[1] : "";
      const cor = COR_POR_ROTULO[String(rotuloCor).trim().toLowerCase()] || "azul";

      if (marcador) marcador.remove();
      // <br/> viraram as quebras de linha na exportação; desfaz isso
      bloco.querySelectorAll("br").forEach(function (br) {
        br.replaceWith(doc.createTextNode("\n"));
      });

      const texto = bloco.textContent.replace(/^\s+|\s+$/g, "");
      if (!texto) return;

      const posicao = importados;
      const x = 24 + (posicao % colunas) * LARGURA;
      const y = 24 + Math.floor(posicao / colunas) * ALTURA;
      createNoteElement(
        Math.min(x, Math.max(24, area.width - 260)),
        Math.min(y, Math.max(24, area.height - 150)),
        texto,
        cor
      );
      importados++;
    });

    // O humor também volta, quando o arquivo trouxer um.
    const selo = doc.querySelector(".mood-badge");
    if (selo) {
      const emoji = (selo.textContent.match(/([\u{1F300}-\u{1FAFF}])/u) || [])[1];
      if (emoji) {
        selectedMood = emoji;
        isMoodWidgetExpanded = false;
        renderMoodWidget();
      }
    }

    if (importados === 0) {
      showToast("Nenhum pensamento encontrado nesse arquivo.", "💡");
      return;
    }

    switchStep(1);
    showToast(importados + (importados === 1 ? " pensamento importado." : " pensamentos importados."), "📥");
  }

  // --------------------------------------------------------------------------
  // Botões do rodapé: só o ícone, e o rótulo abre no hover.
  //
  // A largura de cada rótulo é medida uma vez e publicada como custom
  // property. Um `max-width` chutado no CSS faria o texto abrir depressa e
  // depois esperar parado, porque a transição percorre a distância declarada
  // no mesmo tempo — o mesmo problema das barras.
  // --------------------------------------------------------------------------
  function medirRotulosDoRodape() {
    const rotulos = document.querySelectorAll("#detox-footer .detox-btn-rotulo");
    rotulos.forEach(function (rotulo) {
      // scrollWidth volta 0 aqui: o rótulo está com max-width 0 e overflow
      // hidden. Suspender o limite por um quadro dá a largura real do texto,
      // e a transição fica desligada para a ida e volta não ser vista.
      const transicao = rotulo.style.transition;
      rotulo.style.transition = "none";
      rotulo.style.maxWidth = "none";
      const largura = Math.ceil(rotulo.getBoundingClientRect().width);
      rotulo.style.maxWidth = "";
      void rotulo.offsetWidth;
      rotulo.style.transition = transicao;

      if (largura > 0) rotulo.style.setProperty("--detox-rotulo-w", largura + "px");
    });
  }

  // CONFIRMAÇÃO DE APAGAR (DEIXAR IR)
  function confirmEliminate(fromDownload = false) {
      // A guarda olha as três etapas: dava para ter os blocos cheios, o quadro
      // vazio, e ouvir que "já está em branco" sem conseguir limpar nada.
      const temBloco =
          blockCategories[1].length + blockCategories[2].length + blockCategories[3].length > 0;
      const temAcao =
          microActions.list24h.length > 0 || String(microActions.problem || "").trim() !== "";

      if (notes.length === 0 && !selectedMood && !temBloco && !temAcao) {
          showToast("O quadro já está em branco.", "🍃");
          return;
      }
      openModal('detox-eliminateModal');
  }

  function promptEliminateAfterDownload() {
      setTimeout(() => {
          confirmEliminate(true);
      }, 800);
  }

  // EXECUTAR O EFEITO DE DISSOLUÇÃO TERAPÊUTICA (DEIXAR IR - SUAVE E GRADUAL)
  function executeEliminate() {
      closeModal('detox-eliminateModal');
      isProcessingDisintegration = true;

      // A dissolução é o ponto da ação; se o clique veio de Blocos ou de
      // Ações, volta para o quadro para ela ser vista.
      switchStep(1);

      const widget = document.getElementById('detox-moodWidgetContainer');

      // Adicionar classes de fade-out lentas e pacíficas em todas as notas
      notes.forEach(note => {
          const el = document.getElementById(`detox-note-${note.id}`);
          if (el) el.classList.add('fade-out-peaceful');
      });

      // Adicionar a mesma dissolução sutil ao widget de humor
      if (widget) widget.classList.add('fade-out-peaceful');

      showToast("Deixando ir... Respire fundo...", "🌬️");

      // Redefinir completamente o estado após a dissolução lenta (3.5 segundos)
      setTimeout(() => {
          document.getElementById('detox-notesContainer').innerHTML = '';
          notes = [];
          limparEtapas(); // blocos, ações e os campos das duas — a promessa do
                          // modal é apagar "em todas as partes"
          atualizarBadges();
          selectedMood = null;
          isMoodWidgetExpanded = true; // Retorna ao estado inicial reaberto padrão

          // Centraliza novamente o widget para a posição inicial (padrão primeiro acesso)
          hasDraggedMood = false;
          moodWidgetPos = { x: 0, y: 0 };
          renderMoodWidget();

          if (widget) widget.classList.remove('fade-out-peaceful');
          isProcessingDisintegration = false;

          showToast("Sua mente está limpa e renovada.", "🍃");
      }, 3500);
  }
  // --------------------------------------------------------------------------
  // Inicialização
  // --------------------------------------------------------------------------
  // O quadro ocupa toda a área de conteúdo. A altura não dá para fixar no CSS
  // porque o content-header do painel muda de altura por breakpoint: medimos o
  // topo real do container e descontamos da viewport. Também roda ao abrir a
  // aba (a seção nasce display:none, sem medida) e ao redimensionar.
  function ajustarAltura() {
    const raiz = document.getElementById("detox-root");
    if (!raiz || !raiz.offsetParent) return; // seção ainda oculta
    const topo = raiz.getBoundingClientRect().top;
    raiz.style.height = Math.max(420, Math.round(window.innerHeight - topo)) + "px";
  }

  function init() {
    const raiz = document.getElementById("detox-root");
    if (!raiz || raiz.dataset.detoxIniciado) return;
    raiz.dataset.detoxIniciado = "1";
    // Envelopa as acoes do rodape no menu suspenso do mobile (ver R19).
    montarMenuAcoesRodape();
    renderMoodWidget();
    switchStep(1);   // monta as abas e deixa a etapa 1 visível
    renderDailyWinsInputs();
    ajustarAltura();
    medirRotulosDoRodape();
    window.addEventListener("resize", medirRotulosDoRodape);

    window.addEventListener("resize", ajustarAltura);

    // Antes de o foco mudar, guarda a nota que estava sendo escrita.
    document.addEventListener("mousedown", function (evento) {
      const ativo = document.activeElement;
      const escrevendo =
        ativo && ativo.tagName === "TEXTAREA" && ativo.closest(".note-bubble");
      // Clicar DENTRO da própria nota não conta: ali o cursor só se move.
      notaEmEdicao = escrevendo && !ativo.contains(evento.target) ? ativo : null;
    }, true);

    // a lista do problema fecha ao clicar fora ou no Esc, como um menu
    document.addEventListener("click", function (evento) {
      const combo = el("detox-problemCombo");
      if (combo && !combo.contains(evento.target)) fecharProblemCombo();
    });
    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape") fecharProblemCombo();
    });

    // Abrir a aba é o momento em que a seção ganha medida.
    const link = document.querySelector('.link-nav[title="Detox Mental"]');
    if (link) link.addEventListener("click", () => setTimeout(function () {
      ajustarAltura();
      medirRotulosDoRodape(); // com a seção oculta a medida sai 0
    }, 60));

    // Colapsar/expandir a sidebar muda a largura da área; a altura não, mas o
    // widget de humor é centralizado por CSS e não precisa de recálculo.
  }


  /* ==========================================================================
   * ETAPAS 2 e 3, MÉTODO STOP e DAILY WINS
   *
   * Portado do artefato novo do Gemini Canvas com as MESMAS três adaptações do
   * bloco original (ver cabeçalho): ids prefixados com `detox-`, tudo dentro
   * desta IIFE e exposto só em window.detoxMental, sem window.onload.
   *
   * Só as funções NOVAS vieram do artefato. As 24 que já existiam aqui ficaram
   * como estavam de propósito: o artefato é gerado do zero a cada iteração e
   * não tem os ajustes feitos no projeto — o setupMoodWidgetDragging dele, por
   * exemplo, ainda é a versão por `handle` que o commit fec148d substituiu.
   *
   * Duas diferenças deliberadas em relação ao artefato:
   *   - textos do usuário passam por escaparHTML() antes de entrar em
   *     innerHTML. O artefato interpola item/act crus, e esse conteúdo vem de
   *     post-it e de input.
   *   - os handlers inline não podem mexer em variável de módulo
   *     (`dailyWinsList[i] = this.value` no artefato), então a escrita passa
   *     por detoxMental.setDailyWin / setProblema.
   * ========================================================================== */

  // O detox.js original chama document.getElementById direto; como o bloco
  // abaixo consulta muitos ids, um atalho local evita repetir a chamada.
  function el(id) {
    return document.getElementById(id);
  }

  // Estado das etapas novas.
  let currentStep = 1;
  let blockCategories = { 1: [], 2: [], 3: [] };
  let microActions = { problem: "", list24h: [], listNext: [] };
  let dailyWinsList = [""];
  let draggedKanbanItem = null;
  let draggedActionIndex = null;

  function escaparHTML(valor) {
    return String(valor == null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // --------------------------------------------------------------------------
  // Navegação entre as etapas
  // --------------------------------------------------------------------------
  const CLASSE_ABA_ATIVA =
    "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-md shrink-0";
  const CLASSE_ABA_INATIVA =
    "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50 shrink-0";

  // O selo acompanha o estado da aba: sobre o indigo da ativa ele é um véu
  // claro; sobre a inativa, o mesmo slate das bordas. Antes só a marcação
  // inicial dizia isso, então a etapa 1 ficava com o véu claro mesmo depois de
  // perder o foco.
  const CLASSE_SELO_ATIVO =
    "w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]";
  const CLASSE_SELO_INATIVO =
    "w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[10px]";

  const INSTRUCAO_ETAPA = {
    1: "Clique em qualquer lugar para escrever livremente",
    2: "Importe as notas do Brain Dump ou adicione manualmente",
    3: "Selecione da etapa Blocos ou adicione manualmente",
  };

  // A etapa 1 continua sendo o #detox-whiteboard que já existia: 8 pontos do
  // código antigo o consultam por esse id, então mapear é mais barato (e menos
  // arriscado) do que renomear o container.
  const ID_ETAPA = { 1: "detox-whiteboard", 2: "detox-step2View", 3: "detox-step3View" };

  // Os três selos contam a MESMA coisa: quanto material existe em cada etapa.
  //
  // O arquivo do cliente misturava duas leituras — a etapa 1 trazia um "1" e a
  // etapa 2 um "2", que eram número de etapa, enquanto o JS escrevia contagem
  // nas etapas 2 e 3. Dava a impressão de que o número "zerava" ao abrir a aba
  // Blocos: era só a contagem substituindo o ordinal. A ordem das etapas já
  // está nas setas entre as abas, então aqui todos contam.
  //
  // A etapa 1 conta pensamentos escritos, ignorando post-its em branco — é o
  // mesmo critério que o download e o "deixar ir" usam para decidir se o
  // quadro tem conteúdo.
  function atualizarBadges() {
    const escritos = notes.filter(function (n) {
      return n.text.trim() !== "";
    }).length;
    const blocos =
      blockCategories[1].length + blockCategories[2].length + blockCategories[3].length;

    const valores = { 1: escritos, 2: blocos, 3: microActions.list24h.length };
    [1, 2, 3].forEach(function (s) {
      const selo = el("detox-step" + s + "Badge");
      if (selo) selo.textContent = valores[s];
    });
  }

  // --------------------------------------------------------------------------
  // Recolher as barras (cabeçalho e ações) para o quadro ocupar a tela toda.
  //
  // As duas somem juntas: sozinhas elas deixariam o quadro colado numa borda
  // e sobrando na outra. A altura do #detox-root não muda — o miolo é
  // `flex: 1`, então ele simplesmente cresce e o gatilho continua no mesmo
  // lugar, no topo do quadro.
  // --------------------------------------------------------------------------
  // A altura precisa vir do JS: max-height só anima entre valores concretos, e
  // um valor "grande o bastante" chutado no CSS faz a barra disparar no começo
  // e frear no fim, porque a transição percorre a distância inteira no mesmo
  // tempo. Medindo o natural, a distância é exatamente a que se vê.
  //
  // E a medida tem que ser feita com o estado ABERTO aplicado. Recolhida, a
  // barra está com padding vertical zerado (ele também é animado), então
  // qualquer leitura ali sai sem esses ~24px do cabeçalho e ~32px do rodapé —
  // a animação terminaria curta e o resto apareceria de um golpe quando o
  // limite fosse liberado. Daí abrir, medir e voltar tudo no mesmo quadro,
  // com a transição desligada para nada disso ser visto.
  function medirBarrasAbertas(raiz, barras) {
    const estavaRecolhido = raiz.classList.contains("detox-barras-recolhidas");
    const maxAnterior = barras.map(function (b) { return b.style.maxHeight; });
    const transicaoAnterior = barras.map(function (b) { return b.style.transition; });

    barras.forEach(function (b) {
      b.style.transition = "none";
      b.style.maxHeight = "none";
    });
    raiz.classList.remove("detox-barras-recolhidas");

    const alturas = barras.map(function (b) {
      return Math.ceil(b.getBoundingClientRect().height);
    });

    if (estavaRecolhido) raiz.classList.add("detox-barras-recolhidas");
    barras.forEach(function (b, i) { b.style.maxHeight = maxAnterior[i]; });
    void raiz.offsetHeight; // devolve o estado anterior antes de religar a transição
    barras.forEach(function (b, i) { b.style.transition = transicaoAnterior[i]; });

    return alturas;
  }

  // Zera as etapas 2 e 3: o estado, os campos abertos e o rótulo da lista do
  // problema, que ficaria mostrando um item que não existe mais.
  function limparEtapas() {
    blockCategories = { 1: [], 2: [], 3: [] };
    microActions = { problem: "", list24h: [], listNext: [] };

    [
      "detox-inputBlock1",
      "detox-inputBlock2",
      "detox-inputBlock3",
      "detox-customProblemInput",
      "detox-action24hInput",
    ].forEach(function (id) {
      const campo = el(id);
      if (campo) campo.value = "";
    });

    const rotulo = el("detox-problemComboRotulo");
    if (rotulo) {
      rotulo.textContent = "Selecionar da etapa Blocos";
      rotulo.removeAttribute("title");
    }
    fecharProblemCombo();

    renderBlockCategories();
    renderStep3ProblemSelector();
  }

  function toggleBarras(forcar) {
    const raiz = el("detox-root");
    const gatilho = el("detox-toggleBarras");
    if (!raiz) return;

    const recolhido =
      typeof forcar === "boolean"
        ? forcar
        : !raiz.classList.contains("detox-barras-recolhidas");

    const barras = [el("detox-header"), el("detox-footer")].filter(Boolean);
    const alturas = medirBarrasAbertas(raiz, barras);

    // ponto de partida
    barras.forEach(function (b, i) {
      b.style.maxHeight = (recolhido ? alturas[i] : 0) + "px";
    });
    void raiz.offsetHeight;

    // destino: o limite e o padding caminham juntos, na mesma curva e no mesmo
    // tempo, então a barra chega no fim já com a altura natural — não sobra
    // nada para o navegador resolver de uma vez ao liberar o limite.
    raiz.classList.toggle("detox-barras-recolhidas", recolhido);
    barras.forEach(function (b, i) {
      b.style.maxHeight = (recolhido ? 0 : alturas[i]) + "px";
    });

    // Aberta, a barra volta a ter altura automática: o conteúdo pode quebrar em
    // outra largura depois, e um max-height fixo a cortaria.
    if (!recolhido) {
      barras.forEach(function (b) {
        b.addEventListener("transitionend", function liberar(evento) {
          if (evento.propertyName !== "max-height") return;
          b.removeEventListener("transitionend", liberar);
          b.style.maxHeight = "";
        });
      });
    }

    if (gatilho) {
      const rotulo = recolhido ? "Mostrar as barras" : "Recolher as barras";
      gatilho.setAttribute("aria-expanded", recolhido ? "false" : "true");
      gatilho.setAttribute("aria-label", rotulo);
      gatilho.setAttribute("title", rotulo);
    }
  }

  function switchStep(step) {
    currentStep = step;

    [1, 2, 3].forEach(function (s) {
      const view = el(ID_ETAPA[s]);
      if (view) view.classList.toggle("hidden", s !== step);
      const btn = el("detox-tabBtn" + s);
      if (btn) btn.className = s === step ? CLASSE_ABA_ATIVA : CLASSE_ABA_INATIVA;
      const selo = el("detox-step" + s + "Badge");
      if (selo) selo.className = s === step ? CLASSE_SELO_ATIVO : CLASSE_SELO_INATIVO;
    });

    atualizarBadges();

    const instrucao = el("detox-step1Instruction");
    if (instrucao) {
      instrucao.classList.remove("hidden");
      instrucao.textContent = INSTRUCAO_ETAPA[step] || "";
    }

    if (step === 2) renderBlockCategories();
    if (step === 3) renderStep3ProblemSelector();
  }

  // --------------------------------------------------------------------------
  // Método STOP
  // --------------------------------------------------------------------------
  function openStopModal() {
    openModal("detox-stopModal");
  }

  // --------------------------------------------------------------------------
  // Daily Wins (mural de vitórias)
  // --------------------------------------------------------------------------
  function openDailyWinsModal() {
    if (dailyWinsList.length === 0) dailyWinsList = [""];
    renderDailyWinsInputs();
    openModal("detox-dailyWinsModal");
  }

  function setDailyWin(idx, valor) {
    if (idx >= 0 && idx < dailyWinsList.length) dailyWinsList[idx] = valor;
  }

  function renderDailyWinsInputs() {
    const container = el("detox-victoryInputsContainer");
    if (!container) return;

    container.innerHTML = dailyWinsList
      .map(function (win, idx) {
        const remover = dailyWinsList.length > 1
          ? '<button onclick="detoxMental.removeVictoryField(' + idx + ')" class="text-slate-500 hover:text-rose-400 p-1 text-xs shrink-0" title="Remover">✕</button>'
          : "";
        return (
          '<div class="flex items-center gap-2">' +
          '<span class="text-emerald-400 shrink-0 text-sm">✅</span>' +
          '<input type="text" value="' + escaparHTML(win) + '" ' +
          'oninput="detoxMental.setDailyWin(' + idx + ', this.value)" ' +
          'placeholder="Ex: Concluí o relatório importante, caminhei 30 min..." ' +
          'class="flex-1 bg-[#1b1a2e] border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500">' +
          remover +
          "</div>"
        );
      })
      .join("");
  }

  function addVictoryField() {
    dailyWinsList.push("");
    renderDailyWinsInputs();
  }

  function removeVictoryField(idx) {
    if (dailyWinsList.length > 1) {
      dailyWinsList.splice(idx, 1);
      renderDailyWinsInputs();
    }
  }

  function saveDailyWins() {
    closeModal("detox-dailyWinsModal");
    showToast("Vitória registrada. Ciclo de hoje concluído!", "🏆");
  }

  function celebrateAndClearDailyWins() {
    dailyWinsList = [""];
    renderDailyWinsInputs();
    closeModal("detox-dailyWinsModal");
    showToast("Vitória registrada. Ciclo de hoje concluído!", "🎉");
  }

  function openDailyWinsDownloadModal() {
    closeModal("detox-dailyWinsModal");
    openModal("detox-dailyWinsDownloadModal");
  }

  function openDailyWinsEliminateModal() {
    closeModal("detox-dailyWinsModal");
    openModal("detox-dailyWinsEliminateModal");
  }

  function vitoriasPreenchidas() {
    return dailyWinsList.filter(function (w) {
      return w.trim() !== "";
    });
  }

  function triggerDailyWinsDownload(format) {
    closeModal("detox-dailyWinsDownloadModal");
    const validas = vitoriasPreenchidas();
    if (validas.length === 0) {
      showToast("Nenhuma vitória registrada para salvar.", "💡");
      return;
    }
    if (format === "png") exportDailyWinsPNG(validas);
    else if (format === "pdf") exportDailyWinsPDF(validas);
    else if (format === "docx") exportDailyWinsDOC(validas);
  }

  // Cartão offscreen que o html2canvas fotografa. Estilo inline de propósito:
  // o html2canvas lê o CSS computado, e as utilitárias do detox.css só valem
  // dentro de #detox-root — este nó vive solto no body.
  function montarCartaoVitorias(validas) {
    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:600px;background-color:#12111f;" +
      "color:#f1f5f9;padding:32px;border-radius:24px;border:1px solid rgba(6,95,70,0.6);" +
      "font-family:Inter,Arial,sans-serif;";
    container.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;border-bottom:1px solid #1e293b;padding-bottom:16px;margin-bottom:20px;">' +
      '<span style="font-size:28px;">🏆</span><div>' +
      '<h1 style="font-size:20px;font-weight:bold;color:#ffffff;margin:0;">Daily Wins (Mural de Vitórias)</h1>' +
      '<p style="font-size:12px;color:#94a3b8;margin:4px 0 0 0;">Registrado em ' +
      new Date().toLocaleDateString("pt-BR") + "</p></div></div>" +
      '<div style="display:flex;flex-direction:column;gap:12px;">' +
      validas
        .map(function (win) {
          return (
            '<div style="background-color:#1b1a2e;border:1px solid #065f46;padding:12px 16px;' +
            'border-radius:12px;display:flex;align-items:center;gap:10px;">' +
            '<span style="color:#34d399;font-size:16px;">✅</span>' +
            '<span style="font-size:14px;color:#e2e8f0;font-weight:500;">' + escaparHTML(win) + "</span></div>"
          );
        })
        .join("") +
      "</div>" +
      '<div style="margin-top:24px;text-align:center;font-size:11px;color:#64748b;' +
      'border-top:1px solid #1e293b;padding-top:12px;">Detox Mental • StamFlow</div>';
    document.body.appendChild(container);
    return container;
  }

  function dataArquivo() {
    return new Date().toISOString().split("T")[0];
  }

  function exportDailyWinsPNG(validas) {
    showToast("Gerando imagem das vitórias...", "💾");
    const cartao = montarCartaoVitorias(validas);
    html2canvas(cartao, { backgroundColor: "#0c0b14", scale: 2 })
      .then(function (canvas) {
        const link = document.createElement("a");
        link.download = "Daily_Wins_" + dataArquivo() + ".png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch(function () {
        showToast("Erro ao gerar imagem.", "⚠️");
      })
      .then(function () {
        if (document.body.contains(cartao)) document.body.removeChild(cartao);
      });
  }

  function exportDailyWinsPDF(validas) {
    showToast("Gerando PDF das vitórias...", "💾");
    const cartao = montarCartaoVitorias(validas);
    html2canvas(cartao, { backgroundColor: "#0c0b14", scale: 1.5 })
      .then(function (canvas) {
        const jsPDF = window.jspdf && window.jspdf.jsPDF;
        if (!jsPDF) throw new Error("jsPDF ausente");
        const pdf = new jsPDF("p", "px", [canvas.width, canvas.height]);
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, canvas.width, canvas.height);
        pdf.save("Daily_Wins_" + dataArquivo() + ".pdf");
      })
      .catch(function () {
        showToast("Erro ao gerar PDF.", "⚠️");
      })
      .then(function () {
        if (document.body.contains(cartao)) document.body.removeChild(cartao);
      });
  }

  function exportDailyWinsDOC(validas) {
    showToast("Gerando DOC das vitórias...", "💾");
    const doc =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Daily Wins - Vitórias do Dia</title></head>" +
      '<body style="font-family: Arial, sans-serif; padding: 20px;">' +
      '<h1 style="color: #059669;">🏆 Daily Wins (Mural de Vitórias)</h1>' +
      "<p><strong>Data de Registro:</strong> " + new Date().toLocaleDateString("pt-BR") + "</p>" +
      '<hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;" />' +
      "<h2>Minhas Vitórias do Dia:</h2><ul>" +
      validas
        .map(function (w) {
          return '<li style="font-size: 14px; margin-bottom: 8px;">✅ ' + escaparHTML(w) + "</li>";
        })
        .join("") +
      "</ul></body></html>";

    const blob = new Blob(["﻿" + doc], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Daily_Wins_" + dataArquivo() + ".doc";
    a.click();
    URL.revokeObjectURL(url);
  }

  function executeDailyWinsEliminate() {
    closeModal("detox-dailyWinsEliminateModal");
    isProcessingDisintegration = true;

    switchStep(1);
    isMoodWidgetExpanded = true;
    renderMoodWidget();

    const notas = document.querySelectorAll("#detox-notesContainer .note-bubble");
    notas.forEach(function (n) {
      n.classList.add("fade-out-peaceful");
    });

    showToast("Vitória registrada. Ciclo de hoje concluído.", "🏆");

    setTimeout(function () {
      dailyWinsList = [""];
      renderDailyWinsInputs();
      const container = el("detox-notesContainer");
      if (container) container.innerHTML = "";
      notes = [];
      atualizarBadges();
      isProcessingDisintegration = false;
    }, 3500);
  }

  // --------------------------------------------------------------------------
  // Etapa 2 — Blocos (kanban de 3 categorias)
  // --------------------------------------------------------------------------
  function autoCategorizeNotes() {
    const validas = notes.filter(function (n) {
      return n.text.trim() !== "";
    });
    if (validas.length === 0) {
      showToast("Escreva pensamentos na Parte 1 para importar.", "💡");
      return;
    }

    let adicionadas = 0;
    validas.forEach(function (nota) {
      const texto = nota.text.trim();
      const existe =
        blockCategories[1].indexOf(texto) !== -1 ||
        blockCategories[2].indexOf(texto) !== -1 ||
        blockCategories[3].indexOf(texto) !== -1;
      if (!existe) {
        blockCategories[1].push(texto);
        adicionadas++;
      }
    });

    renderBlockCategories();
    showToast(adicionadas + " pensamentos importados para a Parte 2!", "📂");
  }

  const ROTULO_BLOCO = { 1: "Semana", 2: "Próximas", 3: "Não agora" };
  // Classe inteira, e não "hover:text-" + cor + "-400": o Tailwind gera o CSS
  // varrendo o fonte por strings literais, então classe montada por
  // concatenação simplesmente não é gerada e o hover fica sem efeito.
  const HOVER_BLOCO = {
    1: "hover:text-emerald-400",
    2: "hover:text-blue-400",
    3: "hover:text-rose-400",
  };

  function renderBlockCategories() {
    [1, 2, 3].forEach(function (cat) {
      const container = el("detox-blockCategory" + cat);
      const badge = el("detox-countBlock" + cat);
      if (!container || !badge) return;

      const itens = blockCategories[cat];
      badge.textContent = itens.length;

      if (itens.length === 0) {
        container.innerHTML =
          '<div class="h-28 border border-dashed border-slate-800 rounded-xl flex items-center ' +
          'justify-center text-slate-500 text-xs italic pointer-events-none">Nenhum item inserido</div>';
        return;
      }

      container.innerHTML = itens
        .map(function (item, idx) {
          const mover = [1, 2, 3]
            .filter(function (destino) {
              return destino !== cat;
            })
            .map(function (destino) {
              return (
                '<button onclick="detoxMental.moveBlockItem(' + cat + ", " + destino + ", " + idx + ')" ' +
                'class="' + HOVER_BLOCO[destino] + ' font-semibold">' +
                ROTULO_BLOCO[destino] + "</button>"
              );
            })
            .join("");

          return (
            '<div draggable="true" ' +
            'ondragstart="detoxMental.handleKanbanDragStart(event, ' + cat + ", " + idx + ')" ' +
            'ondragend="detoxMental.handleKanbanDragEnd(event)" ' +
            'class="bg-[#1b1a2e] border border-slate-800 hover:border-slate-700 rounded-xl p-3 ' +
            'flex flex-col gap-2 text-xs text-slate-200 group cursor-grab active:cursor-grabbing transition-all">' +
            '<div class="flex items-start justify-between gap-2">' +
            '<span class="leading-relaxed font-medium">' + escaparHTML(item) + "</span>" +
            '<button onclick="detoxMental.removeBlockItem(' + cat + ", " + idx + ')" ' +
            'class="text-slate-500 hover:text-rose-400 p-0.5 rounded focus:outline-none shrink-0" title="Remover">✕</button>' +
            "</div>" +
            '<div class="flex items-center gap-1.5 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">' +
            "<span>Mover para:</span>" + mover +
            "</div></div>"
          );
        })
        .join("");
    });

    atualizarBadges();
  }

  function handleBlockInput(e, cat) {
    if (e.key !== "Enter") return;
    const valor = e.target.value.trim();
    if (!valor) return;
    blockCategories[cat].push(valor);
    e.target.value = "";
    renderBlockCategories();
  }

  function moveBlockItem(origem, destino, idx) {
    const item = blockCategories[origem].splice(idx, 1)[0];
    if (item) {
      blockCategories[destino].push(item);
      renderBlockCategories();
    }
  }

  function removeBlockItem(cat, idx) {
    blockCategories[cat].splice(idx, 1);
    renderBlockCategories();
  }

  function handleKanbanDragStart(e, cat, idx) {
    draggedKanbanItem = { cat: cat, idx: idx };
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-40");
  }

  function handleKanbanDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  }

  function handleKanbanDrop(e, destino) {
    e.preventDefault();
    if (!draggedKanbanItem) return;
    const item = blockCategories[draggedKanbanItem.cat].splice(draggedKanbanItem.idx, 1)[0];
    if (item) {
      blockCategories[destino].push(item);
      renderBlockCategories();
    }
    draggedKanbanItem = null;
  }

  function handleKanbanDragEnd(e) {
    e.currentTarget.classList.remove("opacity-40");
    draggedKanbanItem = null;
  }

  // --------------------------------------------------------------------------
  // Etapa 3 — Ações de 24h
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // Seletor do problema da semana.
  //
  // A lista traz as TRÊS colunas da etapa Blocos, e não só a primeira: quem
  // separou os itens ali espera reencontrar todos aqui, inclusive para trazer
  // um "não é para agora" à tona. Cada grupo vem rotulado para a origem não se
  // perder.
  // --------------------------------------------------------------------------
  const TITULO_BLOCO = {
    1: "Preciso resolver nesta semana",
    2: "Fica para as próximas semanas",
    3: "Não é para agora",
  };

  // Post-it é texto solto: vem com quebra de linha, espaço dobrado e às vezes
  // vários períodos. Numa lista fechada isso vira uma linha comprida demais.
  //
  // O resumo é deliberadamente simples e previsível: normaliza o espaço, fica
  // com o primeiro período quando ele já diz a coisa (o resto costuma ser
  // detalhe), e só então corta — na última palavra inteira antes do limite,
  // para não partir palavra no meio. O texto cheio continua no title e é ele
  // que vai para o campo ao escolher; o resumo é só o rótulo.
  const LIMITE_RESUMO = 64;

  function resumirTexto(texto) {
    const limpo = String(texto == null ? "" : texto).replace(/\s+/g, " ").trim();
    if (!limpo) return "";

    let base = limpo;
    const fim = base.search(/[.!?](\s|$)/);
    if (fim >= 20 && fim < base.length - 1) base = base.slice(0, fim);

    if (base.length <= LIMITE_RESUMO) return base;

    const corte = base.slice(0, LIMITE_RESUMO);
    const ultimoEspaco = corte.lastIndexOf(" ");
    const aparado = (ultimoEspaco > LIMITE_RESUMO * 0.6 ? corte.slice(0, ultimoEspaco) : corte)
      .replace(/[\s,;:.\-]+$/, "");
    return aparado + " [...]";
  }

  // Índice estável para o clique: o texto cheio não precisa atravessar o HTML.
  let problemasDisponiveis = [];

  function renderStep3ProblemSelector() {
    const lista = el("detox-problemComboLista");
    if (!lista) return;

    problemasDisponiveis = [];
    let html = "";

    [1, 2, 3].forEach(function (cat) {
      const itens = blockCategories[cat];
      if (!itens.length) return;

      html += '<div class="detox-combo-grupo">' + escaparHTML(TITULO_BLOCO[cat]) + "</div>";
      itens.forEach(function (item) {
        const indice = problemasDisponiveis.length;
        problemasDisponiveis.push(item);
        html +=
          '<button type="button" role="option" aria-selected="false" ' +
          'onclick="detoxMental.escolherProblema(' + indice + ')" ' +
          'title="' + escaparHTML(item) + '" class="detox-combo-item detox-combo-item-c' + cat + '">' +
          escaparHTML(resumirTexto(item)) +
          "</button>";
      });
    });

    if (!html) {
      html =
        '<p class="detox-combo-vazio">Nenhum item na etapa Blocos ainda. ' +
        "Importe os pensamentos do Brain Dump ou escreva o problema ao lado.</p>";
    }

    lista.innerHTML = html;
    renderMicroActions();
  }

  function toggleProblemCombo(evento) {
    if (evento) evento.stopPropagation();
    const lista = el("detox-problemComboLista");
    const botao = el("detox-problemComboBtn");
    if (!lista || !botao) return;

    const abrir = lista.classList.contains("hidden");
    lista.classList.toggle("hidden", !abrir);
    botao.setAttribute("aria-expanded", abrir ? "true" : "false");
  }

  function fecharProblemCombo() {
    const lista = el("detox-problemComboLista");
    const botao = el("detox-problemComboBtn");
    if (lista) lista.classList.add("hidden");
    if (botao) botao.setAttribute("aria-expanded", "false");
  }

  function escolherProblema(indice) {
    const item = problemasDisponiveis[indice];
    fecharProblemCombo();
    if (item == null) return;

    const rotulo = el("detox-problemComboRotulo");
    if (rotulo) {
      rotulo.textContent = resumirTexto(item);
      rotulo.title = item;
    }
    handleProblemSelect(item);
  }

  function handleProblemSelect(valor) {
    if (!valor) return;
    // o campo ao lado recebe o texto CHEIO: o resumo é só rótulo de lista
    const campo = el("detox-customProblemInput");
    if (campo) campo.value = valor;
    microActions.problem = valor;
  }

  function setProblema(valor) {
    microActions.problem = valor;
  }

  function addMicroAction() {
    const campo = el("detox-customProblemInput");
    const problema = campo ? campo.value.trim() : "";
    if (!problema) {
      showToast("Por favor, selecione ou digite o problema primeiro.", "⚠️");
      return;
    }
    microActions.problem = problema;

    const input = el("detox-action24hInput");
    if (input && input.value.trim()) {
      microActions.list24h.push(input.value.trim());
      input.value = "";
      renderMicroActions();
    }
  }

  function renderMicroActions() {
    const lista = el("detox-list24h");
    if (!lista) return;

    if (microActions.list24h.length === 0) {
      lista.innerHTML = '<li class="text-slate-500 text-xs italic py-2">Nenhuma ação adicionada ainda.</li>';
    } else {
      lista.innerHTML = microActions.list24h
        .map(function (acao, i) {
          const subir = i > 0
            ? '<button onclick="detoxMental.moveMicroActionUp(' + i + ')" class="text-slate-500 hover:text-emerald-300 p-1 text-[10px]" title="Mover para cima">▲</button>'
            : "";
          const descer = i < microActions.list24h.length - 1
            ? '<button onclick="detoxMental.moveMicroActionDown(' + i + ')" class="text-slate-500 hover:text-emerald-300 p-1 text-[10px]" title="Mover para baixo">▼</button>'
            : "";
          return (
            '<li draggable="true" ' +
            'ondragstart="detoxMental.handleActionDragStart(event, ' + i + ')" ' +
            'ondragover="detoxMental.handleActionDragOver(event)" ' +
            'ondrop="detoxMental.handleActionDrop(event, ' + i + ')" ' +
            'ondragend="detoxMental.handleActionDragEnd(event)" ' +
            'class="flex items-center justify-between gap-3 text-xs text-emerald-200 bg-emerald-950/20 ' +
            'border border-emerald-900/40 px-3.5 py-2.5 rounded-xl transition-all cursor-grab ' +
            'active:cursor-grabbing hover:border-emerald-700/60 group">' +
            '<div class="flex items-center gap-2.5 min-w-0 flex-1">' +
            '<span class="text-slate-500 group-hover:text-emerald-400 text-sm shrink-0 select-none" title="Arraste para reordenar">☰</span>' +
            '<span class="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0">' +
            (i + 1) + "</span>" +
            '<span class="truncate leading-relaxed">' + escaparHTML(acao) + "</span></div>" +
            '<div class="flex items-center gap-1 shrink-0">' + subir + descer +
            '<button onclick="detoxMental.removeMicroAction(' + i + ')" class="text-slate-500 hover:text-rose-400 p-1 ml-1" title="Remover">✕</button>' +
            "</div></li>"
          );
        })
        .join("");
    }

    atualizarBadges();
  }

  function moveMicroActionUp(idx) {
    if (idx <= 0) return;
    const lista = microActions.list24h;
    const tmp = lista[idx];
    lista[idx] = lista[idx - 1];
    lista[idx - 1] = tmp;
    renderMicroActions();
  }

  function moveMicroActionDown(idx) {
    const lista = microActions.list24h;
    if (idx >= lista.length - 1) return;
    const tmp = lista[idx];
    lista[idx] = lista[idx + 1];
    lista[idx + 1] = tmp;
    renderMicroActions();
  }

  function removeMicroAction(idx) {
    microActions.list24h.splice(idx, 1);
    renderMicroActions();
  }

  function handleActionDragStart(e, idx) {
    draggedActionIndex = idx;
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-40");
  }

  function handleActionDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  }

  function handleActionDrop(e, destino) {
    e.preventDefault();
    if (draggedActionIndex === null || draggedActionIndex === destino) return;
    const item = microActions.list24h.splice(draggedActionIndex, 1)[0];
    microActions.list24h.splice(destino, 0, item);
    renderMicroActions();
  }

  function handleActionDragEnd(e) {
    e.currentTarget.classList.remove("opacity-40");
    draggedActionIndex = null;
  }


  window.detoxMental = {
    init: init,
    ajustarAltura: ajustarAltura,
    openModal: openModal,
    closeModal: closeModal,
    handleWhiteboardClick: handleWhiteboardClick,
    openDownloadModal: openDownloadModal,
    abrirImportador: abrirImportador,
    importarArquivo: importarArquivo,
    triggerDownload: triggerDownload,
    confirmEliminate: confirmEliminate,
    executeEliminate: executeEliminate,
    promptEliminateAfterDownload: promptEliminateAfterDownload,
    toggleMoodWidget: toggleMoodWidget,
    selectMood: selectMood,
    toggleColorPicker: toggleColorPicker,
    selectNoteColor: selectNoteColor,
    deleteNote: deleteNote,
    updateNoteText: updateNoteText,

    // --- etapas, barras, Método STOP e Daily Wins ---
    switchStep: switchStep,
    toggleBarras: toggleBarras,
    openStopModal: openStopModal,

    openDailyWinsModal: openDailyWinsModal,
    setDailyWin: setDailyWin,
    addVictoryField: addVictoryField,
    removeVictoryField: removeVictoryField,
    saveDailyWins: saveDailyWins,
    celebrateAndClearDailyWins: celebrateAndClearDailyWins,
    openDailyWinsDownloadModal: openDailyWinsDownloadModal,
    triggerDailyWinsDownload: triggerDailyWinsDownload,
    openDailyWinsEliminateModal: openDailyWinsEliminateModal,
    executeDailyWinsEliminate: executeDailyWinsEliminate,

    autoCategorizeNotes: autoCategorizeNotes,
    handleBlockInput: handleBlockInput,
    moveBlockItem: moveBlockItem,
    removeBlockItem: removeBlockItem,
    handleKanbanDragStart: handleKanbanDragStart,
    handleKanbanDragOver: handleKanbanDragOver,
    handleKanbanDrop: handleKanbanDrop,
    handleKanbanDragEnd: handleKanbanDragEnd,

    handleProblemSelect: handleProblemSelect,
    toggleProblemCombo: toggleProblemCombo,
    escolherProblema: escolherProblema,
    setProblema: setProblema,
    addMicroAction: addMicroAction,
    moveMicroActionUp: moveMicroActionUp,
    moveMicroActionDown: moveMicroActionDown,
    removeMicroAction: removeMicroAction,
    handleActionDragStart: handleActionDragStart,
    handleActionDragOver: handleActionDragOver,
    handleActionDrop: handleActionDrop,
    handleActionDragEnd: handleActionDragEnd,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
