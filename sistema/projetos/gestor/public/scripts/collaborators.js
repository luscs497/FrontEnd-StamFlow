/* ============================================================================
   MÓDULO DE COLABORADORES (Gestão de Acessos + Adição)
   Conectado ao backend real:
     - Listar:    GET    /manager/team
     - Adicionar: POST   /invite/register        (individual)
                  POST   /invite/register/bulk    (massa / CSV)
     - Excluir:   DELETE /auth/bulk               ({ client_ids: [...] })
============================================================================ */
(function() {
const API = "https://api.stamflow.com.br";

function _initColabs() {

    // ==========================================
    // 1. ESTADO GLOBAL
    // ==========================================
    let colaboradores = [];          // lista real vinda do backend
    let selectedIds = new Set();
    let fileCSVContent = "";          // conteúdo do CSV lido

    // Elementos da Lista e Ações
    const colabList = document.getElementById('colab-list');
    const searchInput = document.getElementById('search-collaborator');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const actionBar = document.getElementById('action-bar-selection');
    const selectedCountSpan = document.getElementById('selected-count');
    const btnExcluir = document.getElementById('btn-excluir-selecionados');
    const btnDesfazer = document.getElementById('btn-desfazer-selecao');
    const btnAbrirModal = document.querySelector('.collaborators-action');

    // Elementos da Modal
    const modaisContainer = document.getElementById('modais');
    const modalAdd = document.getElementById('modal-add-colab');
    const btnFecharAddX = document.getElementById('fechar-add-colab');
    const btnCancelarAdd = document.getElementById('btn-cancelar-add-colab');
    const btnImportar = document.getElementById('btn-importar-colab');
    const tabBtns = document.querySelectorAll('.tab-btn-colab');
    const tabContents = document.querySelectorAll('.tab-content-colab');

    // Inputs da Modal
    const inputIndividual = document.getElementById('input-email-individual');
    const inputMassa = document.getElementById('input-email-massa');
    const dropzone = document.getElementById('csv-dropzone');
    const inputFile = document.getElementById('input-csv-file');
    const fileNameDisplay = document.getElementById('csv-file-name');

    if (!colabList) return;

    // fetch com refresh automático (definido em tickets.js); fallback p/ fetch
    const apiFetch = (url, opts = {}) =>
        (window.authFetch || fetch)(url, { credentials: 'include', ...opts });

    // ==========================================
    // 2. RENDERIZAÇÃO E BUSCA (UI)
    // ==========================================

    async function fetchCollaborators() {
        try {
            const res = await apiFetch(`${API}/manager/team`);
            if (res.ok) {
                const data = await res.json();
                // Normaliza: a lista pode ter nome_completo nulo (colaborador
                // que ainda não completou o cadastro via convite).
                colaboradores = (Array.isArray(data) ? data : []).map(c => ({
                    id: c.id,
                    email: c.email,
                    nome: c.nome_completo || null,
                }));
            } else {
                console.error("Erro ao buscar colaboradores:", res.status);
                colaboradores = [];
            }
        } catch (e) {
            console.error("Erro ao buscar colaboradores", e);
            colaboradores = [];
        }

        // Limpa seleções e atualiza UI
        selectedIds.clear();
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        if (actionBar) actionBar.classList.add('display-none');

        renderColabs(searchInput ? searchInput.value : "");

        // Atualiza contador do Header
        const headerCount = document.querySelector('.collaborators-info-quantity h3');
        if (headerCount) headerCount.textContent = colaboradores.length;
    }

    function renderColabs(filterText = "") {
        colabList.innerHTML = "";
        const ft = filterText.toLowerCase();
        const filtered = colaboradores.filter(c =>
            (c.email || "").toLowerCase().includes(ft) ||
            (c.nome || "").toLowerCase().includes(ft)
        );

        if (filtered.length === 0) {
            const li = document.createElement('li');
            li.style.cssText = "padding: 18px 22px; color: #6B7280; font-size: 13.5px;";
            li.textContent = "Nenhum colaborador encontrado.";
            colabList.appendChild(li);
            updateSelectAllState();
            return;
        }

        filtered.forEach(colab => {
            const isSelected = selectedIds.has(colab.id);
            const li = document.createElement('li');
            li.className = `colab-item ${isSelected ? 'selected' : ''}`;

            // Monta o DOM via textContent (previne XSS com dados do backend)
            const wrap = document.createElement('div');
            wrap.style.cssText = "display: flex; gap: 16px; align-items: center;";

            const cb = document.createElement('input');
            cb.type = "checkbox";
            cb.className = "colab-checkbox colab-item-checkbox";
            cb.setAttribute('data-id', colab.id);
            cb.checked = isSelected;

            const p = document.createElement('p');
            p.style.cssText = "font-size: 13.5px; color: #D1D5DB;";
            p.textContent = colab.nome ? `${colab.nome} (${colab.email})` : colab.email;

            wrap.appendChild(cb);
            wrap.appendChild(p);
            li.appendChild(wrap);
            colabList.appendChild(li);
        });

        attachItemListeners();
        updateSelectAllState();
    }

    // ==========================================
    // 3. SELEÇÃO E EXCLUSÃO
    // ==========================================
    function attachItemListeners() {
        document.querySelectorAll('.colab-item-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                if (e.target.checked) {
                    selectedIds.add(id);
                    e.target.closest('li').classList.add('selected');
                } else {
                    selectedIds.delete(id);
                    e.target.closest('li').classList.remove('selected');
                }
                updateActionBar();
                updateSelectAllState();
            });
        });
    }

    function updateActionBar() {
        if (selectedIds.size > 0) {
            actionBar.classList.remove('display-none');
            selectedCountSpan.textContent = selectedIds.size;
        } else {
            actionBar.classList.add('display-none');
        }
    }

    function updateSelectAllState() {
        const visibleCheckboxes = document.querySelectorAll('.colab-item-checkbox');
        if (visibleCheckboxes.length === 0) {
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            return;
        }
        const allChecked = Array.from(visibleCheckboxes).every(cb => cb.checked);
        if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
    }

    if (searchInput) searchInput.addEventListener('input', (e) => renderColabs(e.target.value));

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            document.querySelectorAll('.colab-item-checkbox').forEach(cb => {
                const id = parseInt(cb.getAttribute('data-id'));
                cb.checked = e.target.checked;
                if (e.target.checked) {
                    selectedIds.add(id);
                    cb.closest('li').classList.add('selected');
                } else {
                    selectedIds.delete(id);
                    cb.closest('li').classList.remove('selected');
                }
            });
            updateActionBar();
        });
    }

    if (btnDesfazer) {
        btnDesfazer.addEventListener('click', () => {
            selectedIds.clear();
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            actionBar.classList.add('display-none');
            renderColabs(searchInput ? searchInput.value : "");
        });
    }

    if (btnExcluir) {
        btnExcluir.addEventListener('click', async () => {
            if (selectedIds.size === 0) return;
            const ids = [...selectedIds];
            const txtOriginal = btnExcluir.textContent;
            btnExcluir.textContent = "Excluindo...";
            btnExcluir.disabled = true;

            try {
                const res = await apiFetch(`${API}/auth/bulk`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client_ids: ids }),
                });
                if (!res.ok && res.status !== 204) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || "Erro ao excluir");
                }
            } catch (error) {
                console.error(error);
                alert("Não foi possível excluir os colaboradores. Tente novamente.");
            } finally {
                btnExcluir.textContent = txtOriginal;
                btnExcluir.disabled = false;
                await fetchCollaborators(); // reconstrói a tela a partir do banco
            }
        });
    }

    // ==========================================
    // 4. MODAL "ADICIONAR COLABORADORES"
    // ==========================================
    function extractValidEmails(text) {
        if (!text) return [];
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const found = text.match(emailRegex);
        if (!found) return [];
        return [...new Set(found.map(e => e.toLowerCase()))];
    }

    function checkValidity() {
        let isValid = false;
        const activeEl = document.querySelector('.tab-content-colab:not(.display-none)');
        const activeTab = activeEl ? activeEl.id : 'tab-individual';

        if (activeTab === 'tab-individual') {
            isValid = extractValidEmails(inputIndividual.value).length > 0;
        } else if (activeTab === 'tab-massa') {
            isValid = extractValidEmails(inputMassa.value).length > 0;
        } else if (activeTab === 'tab-csv') {
            isValid = fileCSVContent && extractValidEmails(fileCSVContent).length > 0;
        }

        if (btnImportar) btnImportar.disabled = !isValid;
    }

    if (inputIndividual) inputIndividual.addEventListener('input', checkValidity);
    if (inputMassa) inputMassa.addEventListener('input', checkValidity);

    function fecharModal() {
        modalAdd.classList.add('display-none');
        modaisContainer.classList.add('display-none');

        inputIndividual.value = "";
        inputMassa.value = "";
        inputFile.value = "";
        fileCSVContent = "";
        fileNameDisplay.textContent = "";
        fileNameDisplay.classList.add('display-none');

        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.add('display-none'));
        tabBtns[0].classList.add('active');
        document.getElementById('tab-individual').classList.remove('display-none');

        checkValidity();
    }

    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', () => {
            modaisContainer.classList.remove('display-none');
            modalAdd.classList.remove('display-none');
            checkValidity();
        });
    }

    if (btnFecharAddX) btnFecharAddX.addEventListener('click', fecharModal);
    if (btnCancelarAdd) btnCancelarAdd.addEventListener('click', fecharModal);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('display-none'));
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.remove('display-none');
            checkValidity();
        });
    });

    if (dropzone && inputFile) {
        dropzone.addEventListener('click', () => inputFile.click());
        inputFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameDisplay.textContent = `Arquivo selecionado: ${file.name}`;
                fileNameDisplay.classList.remove('display-none');
                const reader = new FileReader();
                reader.onload = (event) => {
                    fileCSVContent = event.target.result;
                    checkValidity();
                };
                reader.readAsText(file);
            }
        });
    }

    // Botão Importar -> envia convites de colaborador para o backend
    if (btnImportar) {
        btnImportar.addEventListener('click', async () => {
            let emails = [];
            const activeEl = document.querySelector('.tab-content-colab:not(.display-none)');
            const activeTab = activeEl ? activeEl.id : 'tab-individual';

            if (activeTab === 'tab-individual') emails = extractValidEmails(inputIndividual.value);
            else if (activeTab === 'tab-massa') emails = extractValidEmails(inputMassa.value);
            else if (activeTab === 'tab-csv') emails = extractValidEmails(fileCSVContent);

            if (emails.length === 0) return;

            const txtOriginal = btnImportar.textContent;
            btnImportar.textContent = "Processando...";
            btnImportar.disabled = true;

            try {
                let res;
                if (emails.length === 1) {
                    // Convite individual
                    res = await apiFetch(`${API}/invite/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: emails[0], role: 'employee' }),
                    });
                } else {
                    // Convite em lote: array de InviteCreate
                    res = await apiFetch(`${API}/invite/register/bulk`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(emails.map(email => ({ email, role: 'employee' }))),
                    });
                }

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(typeof err.detail === 'string' ? err.detail : "Erro ao enviar convites");
                }

                fecharModal();
                alert(emails.length === 1
                    ? "Convite enviado com sucesso!"
                    : `${emails.length} convites enviados com sucesso!`);
                await fetchCollaborators();
            } catch (error) {
                console.error(error);
                alert(error.message || "Ocorreu um erro ao importar. Tente novamente.");
            } finally {
                btnImportar.textContent = txtOriginal;
                btnImportar.disabled = false;
            }
        });
    }

    // Inicia a tela
    fetchCollaborators();
}
  document.addEventListener("DOMContentLoaded", _initColabs);
  document.addEventListener("painelGestorReady", _initColabs);
})();
