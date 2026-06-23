/* scripts/tickets.js - Lógica de Tickets e Fetch Centralizado (Cookies Version) */
/* MODO TESTE: redirects para login desabilitados — acesso liberado sem cookie. */

// ========================================================================
// 1. REFRESH TOKEN (VIA COOKIE)
// ========================================================================
async function refreshAccessToken() {
    try {
        const response = await fetch("https://api.stamflow.com.br/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({}),
            credentials: 'include'
        });

        if (response.ok) {
            console.log("Token renovado via Cookie!");
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Erro ao tentar refresh:", error);
        return false;
    }
}

// ========================================================================
// 2. LOGOUT (LIMPA COOKIES E REDIRECIONA PARA O LOGIN)
// ========================================================================
function logout() {
    fetch("https://api.stamflow.com.br/auth/logout", {
        method: "POST",
        credentials: 'include'
    }).finally(() => {
        localStorage.removeItem("onboardingCompleted");
        localStorage.removeItem("userCalibration");
        window.location.href = "https://login.stamflow.com.br/";
    });
}

// ========================================================================
// 3. FETCH CENTRALIZADO (AUTH FETCH)
//    Sobrescreve o window.authFetch definido por auth.js com a mesma lógica,
//    garantindo que tickets.js também não redirecione.
// ========================================================================
window.authFetch = async function(url, options = {}) {
    options.credentials = 'include';

    if (options.headers && options.headers['Authorization']) {
        delete options.headers['Authorization'];
    }

    let response = await fetch(url, options);

    if (response.status === 401) {
        console.log("401 detectado! Tentando refresh via cookie...");

        const refreshed = await refreshAccessToken();

        if (refreshed) {
            console.log("Refreshed! Retentando requisição original...");
            response = await fetch(url, options);
        } else {
            // Sessão inválida: redireciona para o login.
            window.location.href = "https://login.stamflow.com.br/";
        }
    }

    return response;
};

const authFetch = window.authFetch;


// ========================================================================
// 4. LÓGICA DE TICKETS
// ========================================================================

const criarTicket = document.getElementById("criarTicket");

if(criarTicket){
    criarTicket.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const assunto = document.getElementById("assunto-input").value;
        const mensagem = document.getElementById("mensagemTicket").value;

        const payload = {
            assunto: assunto,
            mensagem_inicial: mensagem
        }

        const createTicketEndpoint = "https://api.stamflow.com.br/tickets/";

        try {
            const res = await authFetch(createTicketEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const ticketCriado = await res.json();
                console.log("Ticket criado com sucesso: ", ticketCriado);
                criarTicket.reset();
                if(typeof reportsDiv !== 'undefined' && reportsDiv && !reportsDiv.classList.contains("display-none")) {
                    buscarTicketsAbertos();
                }
                alert("Ticket criado com sucesso!");
            } else {
                const erro = await res.json();
                alert("Erro: " + (erro.detail || "Falha ao criar Ticket"));
            }
        } catch (error) {
            console.error("Erro: ", error)
        }
    });
}

const STATUS_LABELS = {
    aberto: "Aberto",
    em_andamento: "Em andamento",
    concluido: "Concluído"
};

function aplicarStatusNaDiv(divStatus, status) {
    if (!divStatus) return;
    const p = divStatus.querySelector("p") || divStatus;
    p.textContent = STATUS_LABELS[status] || status;

    divStatus.classList.remove("status-concluido", "status-em_andamento");
    if (status === "concluido") {
        divStatus.classList.add("status-concluido");
    } else if (status === "em_andamento") {
        divStatus.classList.add("status-em_andamento");
    }
}

function renderizarConversas(ticket) {
    let conversas = document.createElement("ul");
    conversas.classList.add("conversas", "gap-16");

    if(ticket.messages && Array.isArray(ticket.messages)) {
        ticket.messages.forEach((el) => {
            let li = document.createElement("li");
            let title = document.createElement("h4");
            let p = document.createElement("p");

            li.classList.add("mensagem", "gap-8");

            if(el.author_type === "gestor") {
                title.textContent = "Resposta do Ticket:";
                li.classList.add("mensagem-gestor");
            } else {
                title.textContent = "Você:";
                li.classList.add("mensagem-cliente");
            }

            p.textContent = el.content;
            li.appendChild(title);
            li.appendChild(p);

            conversas.appendChild(li);
        });
    }

    return conversas;
}

function criarTicketMinimizado(ticket) {
    const li = document.createElement("li");
    li.classList.add("ticket-minimizado");
    if (ticket.id != null) li.dataset.ticketId = String(ticket.id);

    const primeiraMsg = (ticket.messages && ticket.messages.length > 0)
        ? ticket.messages[0].content
        : "Sem mensagem inicial";

    li.innerHTML = `
        <div class="ticket-minimizado-header">
            <h3>${ticket.assunto}</h3>
            <div class="report-status">
                <p>${ticket.status}</p>
            </div>
        </div>
        <p class="ticket-msg-resumida">
            ${primeiraMsg}
        </p>
    `;

    aplicarStatusNaDiv(li.querySelector(".report-status"), ticket.status);

    li.addEventListener("click", () => {
        if(tickets) tickets.classList.add("display-none");
        if(ticketTemplate) ticketTemplate.classList.remove("display-none");
        atualizarTicketMaximizado(ticket);
        ticketAtual = ticket;
    });

    return li;
}

function atualizarTicketMaximizado(ticket) {
    const ticketExpandido = document.querySelector(".ticket-expandido");
    if(!ticketExpandido) return;

    const ticketMini = ticketExpandido.querySelector(":scope > .ticket-minimizado");

    if(ticketMini) {
        ticketMini.querySelector("h3").textContent = ticket.assunto;
        aplicarStatusNaDiv(ticketMini.querySelector(".report-status"), ticket.status);

        const primeiraMsg = (ticket.messages && ticket.messages.length > 0)
            ? ticket.messages[0].content
            : "Sem mensagem";

        ticketMini.querySelector(".ticket-msg-resumida").textContent = primeiraMsg;

        const conversasAntigas = ticketMini.querySelector(".conversas");
        if (conversasAntigas) conversasAntigas.remove();

        const novasConversas = renderizarConversas(ticket);
        ticketMini.appendChild(novasConversas);
    }
}

function atualizarConversas(ticket) {
    const ticketExpandido = document.querySelector(".ticket-expandido");
    if(!ticketExpandido) return;

    const ticketMini = ticketExpandido.querySelector(":scope > .ticket-minimizado");
    if(ticketMini) {
        const conversasAntigas = ticketMini.querySelector(".conversas");
        if (conversasAntigas) conversasAntigas.remove();

        const novasConversas = renderizarConversas(ticket);
        ticketMini.appendChild(novasConversas);
    }
}

const voltar = document.querySelector(".voltar");
const ticketTemplate = document.querySelector(".ticket-expandido");
const tickets = document.querySelector(".tickets");
const reportsDiv = document.getElementById("modal-tickets");
const closeTicketsDiv = document.getElementById("close-popup-tickets");
const verTickets = document.querySelector(".btn.btn-yellow-svg");
let ticketAtual = null;

const modaisDiv = document.getElementById("modais");

function toggleModalTicket(div) {
    if(modaisDiv) modaisDiv.classList.toggle("display-none");
    if(div) div.classList.toggle("display-none");
}

async function buscarTicketsAbertos() {
    const endpoint = "https://api.stamflow.com.br/tickets/my-tickets";

    try {
        const res = await authFetch(endpoint);

        if (res.ok) {
            const todosTickets = await res.json();
            if(tickets) {
                tickets.querySelectorAll("li").forEach(li => li.remove());
                todosTickets.forEach(el => {
                    let li = criarTicketMinimizado(el);
                    tickets.appendChild(li);
                });
            }
        } else {
            console.error("Erro ao buscar tickets");
        }
    } catch (error) {
        console.error("Erro de rede:", error);
    }
}

async function enviarNovaMensagem(ticket, mensagem) {
    const endpoint = `https://api.stamflow.com.br/tickets/${ticket.id}/reply`;

    try {
        const res = await authFetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: mensagem })
        });

        if (!res.ok) {
            throw new Error("Erro ao enviar mensagem");
        }

        const novaMensagem = await res.json();

        if(!ticket.messages) ticket.messages = [];
        ticket.messages.push(novaMensagem);

        // Regra do backend: mensagem do cliente só muda o status se o ticket
        // estava "concluido" (reabre para "em_andamento"). Se estava "aberto"
        // ou já "em_andamento", o status permanece como está.
        if (ticket.status === "concluido") {
            ticket.status = "em_andamento";
        }

        atualizarConversas(ticket);
        atualizarStatusNaTela(ticket);

    } catch (error) {
        console.error("Erro de rede:", error);
        alert("Erro ao enviar mensagem.");
    }
}

function atualizarStatusNaTela(ticket) {
    const ticketExpandido = document.querySelector(".ticket-expandido");
    if(ticketExpandido) {
        const ticketMini = ticketExpandido.querySelector(":scope > .ticket-minimizado");
        if(ticketMini) {
            aplicarStatusNaDiv(ticketMini.querySelector(".report-status"), ticket.status);
        }
    }

    // A lista principal (.tickets) mantém os <li> antigos em memória mesmo
    // depois de "Voltar" — sem re-fetch, eles só seriam atualizados na
    // próxima abertura do modal. Atualizamos aqui para refletir na hora.
    if (tickets && ticket.id != null) {
        const item = tickets.querySelector(`.ticket-minimizado[data-ticket-id="${ticket.id}"]`);
        if (item) {
            aplicarStatusNaDiv(item.querySelector(".report-status"), ticket.status);
        }
    }
}

const btnEnviar = document.getElementById("enviar-mensagem");
const textarea = document.getElementById("nova-mensagem");

if(btnEnviar && textarea){
    btnEnviar.addEventListener("click", () => {
        if (!ticketAtual) return;

        const mensagem = textarea.value.trim();
        if (!mensagem) return;

        enviarNovaMensagem(ticketAtual, mensagem);
        textarea.value = "";
    });
}

if(verTickets){
    verTickets.addEventListener('click', () => {
        toggleModalTicket(reportsDiv);
        buscarTicketsAbertos();
    });
}

if(closeTicketsDiv){
    closeTicketsDiv.addEventListener('click', () => {
        toggleModalTicket(reportsDiv);
        if(tickets) tickets.querySelectorAll("li").forEach(li => li.remove());
    });
}

if(voltar){
    voltar.addEventListener('click', () => {
        if(tickets) tickets.classList.remove("display-none");
        if(ticketTemplate) ticketTemplate.classList.add("display-none");
    });
}
