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
  let activeDragNote = null;
  let dragOffset = { x: 0, y: 0 };
  let activeDragWidget = null;
  let widgetOffset = { x: 0, y: 0 };
  let moodWidgetPos = { x: 0, y: 0 };
  let hasDraggedMood = false; // Controle de centralização inicial do primeiro acesso

  // CONFIGURAÇÕES DOS MODAIS
  function openModal(id) {
      const modal = document.getElementById(id);
      modal.classList.remove('hidden');
      setTimeout(() => {
          modal.querySelector('div').classList.remove('scale-95');
      }, 10);
  }

  function closeModal(id) {
      const modal = document.getElementById(id);
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => {
          modal.classList.add('hidden');
      }, 150);
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
          container.style.left = `${moodWidgetPos.x}px`;
          container.style.top = `${moodWidgetPos.y}px`;
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

      // Adicionar ao array de controle do estado
      notes.push({
          id: id,
          x: x,
          y: y,
          text: text,
          colorName: colorName
      });

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
      }
  }

  // APAGAR NOTA ESPECÍFICA
  function deleteNote(id, event) {
      event.stopPropagation();
      notes = notes.filter(n => n.id !== id);
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

          activeDragNote.style.left = `${x}px`;
          activeDragNote.style.top = `${y}px`;

          const noteId = parseInt(activeDragNote.id.replace('note-', ''));
          const note = notes.find(n => n.id === noteId);
          if (note) {
              note.x = x;
              note.y = y;
          }
      }

      if (activeDragWidget) {
          const boardRect = document.getElementById('detox-whiteboard').getBoundingClientRect();
          let x = e.clientX - boardRect.left - widgetOffset.x;
          let y = e.clientY - boardRect.top - widgetOffset.y;

          x = Math.max(0, Math.min(x, boardRect.width - activeDragWidget.offsetWidth));
          y = Math.max(0, Math.min(y, boardRect.height - activeDragWidget.offsetHeight));

          activeDragWidget.style.left = `${x}px`;
          activeDragWidget.style.top = `${y}px`;

          moodWidgetPos.x = x;
          moodWidgetPos.y = y;
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

          activeDragNote.style.left = `${x}px`;
          activeDragNote.style.top = `${y}px`;
      }

      if (activeDragWidget) {
          const boardRect = document.getElementById('detox-whiteboard').getBoundingClientRect();
          const touch = e.touches[0];
          let x = touch.clientX - boardRect.left - widgetOffset.x;
          let y = touch.clientY - boardRect.top - widgetOffset.y;

          x = Math.max(0, Math.min(x, boardRect.width - activeDragWidget.offsetWidth));
          y = Math.max(0, Math.min(y, boardRect.height - activeDragWidget.offsetHeight));

          activeDragWidget.style.left = `${x}px`;
          activeDragWidget.style.top = `${y}px`;

          moodWidgetPos.x = x;
          moodWidgetPos.y = y;
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

  // CONFIRMAÇÃO DE APAGAR (DEIXAR IR)
  function confirmEliminate(fromDownload = false) {
      if (notes.length === 0 && !selectedMood) {
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
    renderMoodWidget();
    ajustarAltura();

    window.addEventListener("resize", ajustarAltura);

    // Abrir a aba é o momento em que a seção ganha medida.
    const link = document.querySelector('.link-nav[title="Detox Mental"]');
    if (link) link.addEventListener("click", () => setTimeout(ajustarAltura, 60));

    // Colapsar/expandir a sidebar muda a largura da área; a altura não, mas o
    // widget de humor é centralizado por CSS e não precisa de recálculo.
  }

  window.detoxMental = {
    init: init,
    ajustarAltura: ajustarAltura,
    openModal: openModal,
    closeModal: closeModal,
    handleWhiteboardClick: handleWhiteboardClick,
    openDownloadModal: openDownloadModal,
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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
