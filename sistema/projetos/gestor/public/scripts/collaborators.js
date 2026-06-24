/* ============================================================================
   MÓDULO DE COLABORADORES (Gestão de Acessos + Adição)
   Conectado ao backend real:
     - Listar:    GET    /manager/team/full        (Clients ativos + Invites
                                                      pendentes, com status)
     - Adicionar: POST   /invite/register        (individual)
                  POST   /invite/register/bulk    (massa / CSV)
     - Excluir:   DELETE /auth/bulk               ({ client_ids: [...] })
                  DELETE /invite/bulk             ({ invite_ids: [...] })
============================================================================ */
(function() {
const API = "https://api.stamflow.com.br";

function _initColabs() {

    // ==========================================
    // 1. ESTADO GLOBAL
    // ==========================================
    let colaboradores = [];          // lista real vinda do backend
    let selectedKeys = new Set();    // chaves compostas "origin:origin_id"
    let statusFiltro = "todos";      // "todos" | "ativo" | "inativo"
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
    const filtroBtns = document.querySelectorAll('.colab-filtro-btn');

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

    async function fetchLicenseUsage() {
        const box = document.getElementById('license-usage-text');
        if (!box) return;
        try {
            const res = await apiFetch(`${API}/manager/license-usage`);
            if (!res.ok) return;
            const data = await res.json();
            box.textContent = `${data.used_employees}/${data.max_employees}`;
            box.classList.remove('licenca-cheia', 'licenca-alerta');
            if (!data.subscription_active || data.used_employees >= data.max_employees) {
                box.classList.add('licenca-cheia');
            } else if (data.max_employees > 0 && data.used_employees / data.max_employees >= 0.8) {
                box.classList.add('licenca-alerta');
            }
        } catch (e) {
            console.error("Erro ao buscar uso de licença", e);
        }
    }

    async function fetchCollaborators() {
        try {
            const res = await apiFetch(`${API}/manager/team/full`);
            if (res.ok) {
                const data = await res.json();
                // Cada item já vem normalizado pelo backend: origin
                // ("client" | "invite"), origin_id, email, status
                // ("ativo" | "inativo") e nome_completo (pode ser nulo).
                colaboradores = (Array.isArray(data) ? data : []).map(c => ({
                    origin: c.origin,
                    originId: c.origin_id,
                    email: c.email,
                    nome: c.nome_completo || null,
                    status: c.status,
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
        selectedKeys.clear();
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        if (actionBar) actionBar.classList.add('display-none');

        renderColabs(searchInput ? searchInput.value : "");

        // Atualiza contador do Header (só conta quem já tem conta ativa,
        // que é o que "VIDAS ATIVAS" deveria significar).
        const headerCount = document.querySelector('.collaborators-info-quantity h3');
        if (headerCount) headerCount.textContent = colaboradores.filter(c => c.status === 'ativo').length;

        fetchLicenseUsage();
    }

    function colabKey(colab) { return `${colab.origin}:${colab.originId}`; }

    function renderColabs(filterText = "") {
        colabList.innerHTML = "";
        const ft = filterText.toLowerCase();
        const filtered = colaboradores.filter(c => {
            const matchesText = (c.email || "").toLowerCase().includes(ft) ||
                (c.nome || "").toLowerCase().includes(ft);
            const matchesStatus = statusFiltro === "todos" || c.status === statusFiltro;
            return matchesText && matchesStatus;
        });

        if (filtered.length === 0) {
            const li = document.createElement('li');
            li.style.cssText = "padding: 18px 22px; color: #6B7280; font-size: 13.5px;";
            li.textContent = "Nenhum colaborador encontrado.";
            colabList.appendChild(li);
            updateSelectAllState();
            return;
        }

        filtered.forEach(colab => {
            const key = colabKey(colab);
            const isSelected = selectedKeys.has(key);
            const li = document.createElement('li');
            li.className = `colab-item ${isSelected ? 'selected' : ''}`;

            // Monta o DOM via textContent (previne XSS com dados do backend)
            const wrap = document.createElement('div');
            wrap.style.cssText = "display: flex; gap: 16px; align-items: center;";

            const cb = document.createElement('input');
            cb.type = "checkbox";
            cb.className = "colab-checkbox colab-item-checkbox";
            cb.setAttribute('data-key', key);
            cb.checked = isSelected;

            const p = document.createElement('p');
            p.style.cssText = "font-size: 13.5px; color: #D1D5DB;";
            p.textContent = colab.nome ? `${colab.nome} (${colab.email})` : colab.email;

            wrap.appendChild(cb);
            wrap.appendChild(p);
            li.appendChild(wrap);

            const statusBadge = document.createElement('span');
            statusBadge.className = `colab-status status-${colab.status}`;
            statusBadge.textContent = colab.status === 'ativo' ? 'Ativo' : 'Inativo';
            li.appendChild(statusBadge);

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
                const key = e.target.getAttribute('data-key');
                if (e.target.checked) {
                    selectedKeys.add(key);
                    e.target.closest('li').classList.add('selected');
                } else {
                    selectedKeys.delete(key);
                    e.target.closest('li').classList.remove('selected');
                }
                updateActionBar();
                updateSelectAllState();
            });
        });
    }

    function updateActionBar() {
        if (selectedKeys.size > 0) {
            actionBar.classList.remove('display-none');
            selectedCountSpan.textContent = selectedKeys.size;
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

    if (filtroBtns.length > 0) {
        filtroBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                statusFiltro = btn.getAttribute('data-filtro') || 'todos';
                filtroBtns.forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                renderColabs(searchInput ? searchInput.value : "");
            });
        });
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            document.querySelectorAll('.colab-item-checkbox').forEach(cb => {
                const key = cb.getAttribute('data-key');
                cb.checked = e.target.checked;
                if (e.target.checked) {
                    selectedKeys.add(key);
                    cb.closest('li').classList.add('selected');
                } else {
                    selectedKeys.delete(key);
                    cb.closest('li').classList.remove('selected');
                }
            });
            updateActionBar();
        });
    }

    if (btnDesfazer) {
        btnDesfazer.addEventListener('click', () => {
            selectedKeys.clear();
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            actionBar.classList.add('display-none');
            renderColabs(searchInput ? searchInput.value : "");
        });
    }

    if (btnExcluir) {
        btnExcluir.addEventListener('click', async () => {
            if (selectedKeys.size === 0) return;

            // Cada chave é "origin:origin_id" — separamos porque clients e
            // invites pendentes vivem em tabelas (e rotas de exclusão)
            // diferentes no backend.
            const clientIds = [];
            const inviteIds = [];
            selectedKeys.forEach(key => {
                const [origin, id] = key.split(':');
                if (origin === 'client') clientIds.push(parseInt(id));
                else if (origin === 'invite') inviteIds.push(parseInt(id));
            });

            const txtOriginal = btnExcluir.textContent;
            btnExcluir.textContent = "Excluindo...";
            btnExcluir.disabled = true;

            const erros = [];

            if (clientIds.length > 0) {
                try {
                    const res = await apiFetch(`${API}/auth/bulk`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ client_ids: clientIds }),
                    });
                    if (!res.ok && res.status !== 204) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.detail || "Erro ao excluir colaboradores ativos");
                    }
                } catch (error) {
                    console.error(error);
                    erros.push(error.message || "Erro ao excluir colaboradores ativos.");
                }
            }

            if (inviteIds.length > 0) {
                try {
                    const res = await apiFetch(`${API}/invite/bulk`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ invite_ids: inviteIds }),
                    });
                    if (!res.ok && res.status !== 204) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.detail || "Erro ao cancelar convites pendentes");
                    }
                } catch (error) {
                    console.error(error);
                    erros.push(error.message || "Erro ao cancelar convites pendentes.");
                }
            }

            if (erros.length > 0) {
                alert(erros.join("\n"));
            }

            btnExcluir.textContent = txtOriginal;
            btnExcluir.disabled = false;
            await fetchCollaborators(); // reconstrói a tela a partir do banco
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

                // O backend processa o lote parcialmente: e-mails já
                // cadastrados (conta avulsa, gestor, ou colaborador
                // existente) são pulados e reportados em "message", mas o
                // restante do lote é convidado normalmente — por isso lemos
                // a mensagem do backend em vez de um texto fixo de sucesso.
                const data = await res.json().catch((parseErr) => {
                    console.error("Falha ao parsear JSON da resposta de convite:", parseErr);
                    return null;
                });
                console.log("Resposta do backend ao importar colaboradores:", data);

                fecharModal();
                if (data && data.message) {
                    alert(data.message);
                } else {
                    console.warn("Resposta sem 'message' utilizável; usando fallback genérico.", data);
                    alert(emails.length === 1
                        ? "Convite enviado com sucesso!"
                        : `${emails.length} convites enviados com sucesso!`);
                }
                await fetchCollaborators();
            } catch (error) {
                console.error(error);
                alert(error.message || "Ocorreu um erro ao importar. Tente novamente.");
                fetchLicenseUsage(); // o erro pode ser de limite; atualiza o indicador
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
