/* scripts/ticket.js - Lógica de Tickets do Gestor (Cookies Version) */

let ticketAtual = null;

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
            console.log("Sessão expirou (Refresh inválido).");
            logout();
            return false;
        }
    } catch (error) {
        console.error("Erro ao tentar refresh:", error);
        return false;
    }
}

// ========================================================================
// 2. LOGOUT (LIMPA COOKIES E REDIRECIONA PARA NOVO LOGIN)
// ========================================================================
function logout() {
    fetch("https://api.stamflow.com.br/auth/logout", { 
        method: "POST", 
        credentials: 'include' 
    }).finally(() => {
        localStorage.removeItem("onboardingCompleted");
        localStorage.removeItem("userCalibration");
        // Redirecionamento atualizado para o subdomínio de login
        window.location.href = "https://login.stamflow.com.br/";
    });
}

// ========================================================================
// 3. FETCH CENTRALIZADO (AUTH FETCH)
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
            logout();
        }
    }

    return response;
};

// ========================================================================
// 4. LÓGICA DE TICKETS (EMPRESA)
// ========================================================================

async function getCompanyTickets() {
    const endpoint = "https://api.stamflow.com.br/tickets/company-tickets";
    try {
        const res = await window.authFetch(endpoint);
        if(res.ok) {
            const ticketsEmpresa = await res.json();
            return ticketsEmpresa;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

const TAG_LABELS = {
    operational: "Operacional",
    hr_management: "Gestão RH",
    legal: "Legal/Jurídico"
};

function getByStatus(tickets, status) {
    if (!tickets) return [];
    let lista = [];
    tickets.forEach(el => {
        if(el.status === status) {
            lista.push(el);
        }
    });

    return lista;
}

function calcularTempoPassado(dataISO) {
    const dataPassada = new Date(dataISO);
    const dataAtual = new Date();
    
    const diferencaMs = dataAtual - dataPassada;
    
    const segundos = Math.floor(diferencaMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (segundos < 60) {
        return "Agora mesmo";
    } else if (minutos < 60) {
        return `Há ${minutos} min`;
    } else if (horas < 24) {
        return `Há ${horas}h`; 
    } else if (dias < 7) {
        return `Há ${dias} dias`;
    } else {
        return dataPassada.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
        });
    }
}

function gerarMinimizados (lista) {
    const reportDiv = document.querySelector(".pop-ups");
    const listaTickets = document.createElement("ul");
    listaTickets.classList.add("lista-reports", "gap-16");

    if (!lista || lista.length === 0) {
        listaTickets.innerHTML = "<p style='font-size:0.8em; color:#888;'>Nenhum ticket.</p>";
        return listaTickets;
    }

    lista.forEach(el => {
        const li = document.createElement("li");
        li.classList.add("gap-8");

        const div = document.createElement("div");
        div.classList.add("reports-info", "space-btw");

        const h4 = document.createElement("h4");

        const p = document.createElement("p");

        const tagIndicador = document.createElement("span");
        tagIndicador.classList.add("report-tag-indicador");
        if (el.tag === "hr_management") tagIndicador.classList.add("tag-hr_management");
        else if (el.tag === "legal") tagIndicador.classList.add("tag-legal");
        tagIndicador.innerHTML = `<span class="bolinha"></span>${TAG_LABELS[el.tag] || el.tag}`;

        const pMsg = document.createElement("p");
        pMsg.classList.add("report-description");

        const button = document.createElement("button");
        button.classList.add("abrir-detalhes-report");

        h4.textContent = el.assunto;
        p.textContent = calcularTempoPassado(el.atualizado_em);
        
        // Pega primeira mensagem se existir
        pMsg.textContent = (el.messages && el.messages.length > 0) 
            ? el.messages[0].content 
            : "Sem mensagem";

        button.textContent = "Ver Detalhes";
        button.onclick = () => {
            updateDetalhes(el);
            if(reportDiv) reportDiv.classList.remove("display-none");
            ticketAtual = el;
        };

        div.appendChild(h4);
        div.appendChild(p);
        li.appendChild(div);
        li.appendChild(tagIndicador);
        li.appendChild(pMsg);
        li.appendChild(button);

        listaTickets.appendChild(li);
    });

    return listaTickets;
}

function renderizarConversas(ticket, conversas) {
    const conversasAntigas = conversas.querySelectorAll("li");
    if (conversasAntigas) {
        conversasAntigas.forEach(li => li.remove());
    }

    if(ticket.messages) {
        ticket.messages.forEach((el, index) => {
            let li = document.createElement("li");
            let title = document.createElement("h4");
            let p = document.createElement("p");

            li.classList.add("mensagem", "gap-8");

            // No Gestor, as mensagens pares (0,2) são do Cliente
            // Ímpares (1,3) são do Gestor (Você)
            if(index % 2 === 0) {
                title.textContent = "Cliente:";
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
}

function updateDetalhes(ticket) {
    const assuntoExpandido = document.getElementById("maximizado-assunto");
    const tempoExpandido = document.getElementById("maximizado-tempo");
    const statusExpandido = document.getElementById("maximizado-status");
    const tagExpandido = document.getElementById("maximizado-tag");
    const conversasExpandido = document.getElementById("conversas");

    if(assuntoExpandido) assuntoExpandido.textContent = ticket.assunto;
    if(tempoExpandido) tempoExpandido.textContent = calcularTempoPassado(ticket.atualizado_em);
    if(statusExpandido) statusExpandido.textContent = ticket.status;
    if(tagExpandido) tagExpandido.textContent = TAG_LABELS[ticket.tag] || ticket.tag;
    if(conversasExpandido) renderizarConversas(ticket, conversasExpandido);
}

async function showMinimizados () {
    const ticketsList = await getCompanyTickets();
    
    // Se falhar o fetch, retorna null e não faz nada
    if(!ticketsList) return;

    const ticketsAberto = getByStatus(ticketsList, "aberto");
    const ticketsAndamento = getByStatus(ticketsList, "em_andamento");
    const ticketsConcluidos = getByStatus(ticketsList, "concluido");
    const divsTickets = document.querySelectorAll(".classificacao-reports");

    divsTickets.forEach(el => {
        const listaAntiga = el.querySelector("ul");
        
        if (listaAntiga) {
            listaAntiga.remove();
        }
        
        switch (el.getAttribute("status")){
            case "aberto":
                el.appendChild(gerarMinimizados(ticketsAberto));
                break;
            case "em-andamento":
                el.appendChild(gerarMinimizados(ticketsAndamento));
                break;
            case "concluido":
                el.appendChild(gerarMinimizados(ticketsConcluidos));
                break;
        }
    });
}

async function updateTicketStatus(ticketId, newStatus) {
    const endpoint = `https://api.stamflow.com.br/tickets/${ticketId}/status`;
    const payload = { status: newStatus };

    try {
        const res = await window.authFetch(endpoint, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if(res.ok) {
            showMinimizados();
        }
    } catch (error) {
        console.log(error);
    }
}

async function updateTicketTag(ticketId, newTag) {
    const endpoint = `https://api.stamflow.com.br/tickets/${ticketId}/tag`;
    const payload = { tag: newTag };

    try {
        const res = await window.authFetch(endpoint, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if(res.ok) {
            showMinimizados();
        }
    } catch (error) {
        console.log(error);
    }
}

async function sendNewMessage(ticket, mensagem) {
    const endpoint = `https://api.stamflow.com.br/tickets/${ticket.id}/reply`;
    
    try {
        const res = await window.authFetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: mensagem })
        });

        if (!res.ok) {
            throw new Error("Erro ao enviar mensagem");
        }

        showMinimizados();

    } catch (error) {
        console.error("Erro de rede:", error);
    }
}


const ticketsSection = document.getElementById("tickets-section-link");
const btnSalvar = document.getElementById("btn-salvar");
const btnEnviar = document.getElementById("btn-enviar");
const reportDiv = document.querySelector(".pop-ups");

if(ticketsSection){
    ticketsSection.addEventListener("click", () => {
        showMinimizados();
    });
}

if(btnSalvar){
    btnSalvar.addEventListener("click", () => {
        if(reportDiv) reportDiv.classList.add("display-none");
        const statusSelecionado = [...document.querySelectorAll(".status-opcao")].filter(el => el.classList.length > 1);
        const tagSelecionada = [...document.querySelectorAll(".tag-opcao")].filter(el => el.classList.length > 1);

        if(ticketAtual && statusSelecionado.length > 0) {
            updateTicketStatus(ticketAtual.id, statusSelecionado[0].getAttribute("status"));
        }
        if(ticketAtual && tagSelecionada.length > 0) {
            updateTicketTag(ticketAtual.id, tagSelecionada[0].getAttribute("tag"));
        }
    });
}

if(btnEnviar){
    btnEnviar.addEventListener("click", () => {
        if (!ticketAtual || !ticketAtual.messages) return;

        // Regra de negócio: Gestor responde se for ímpar (ou se for msg do cliente)
        // Se length é par (0, 2), última msg foi 1 (Gestor). Vez do Cliente.
        // Se length é ímpar (1, 3), última msg foi 0 (Cliente). Vez do Gestor.
        
        if (ticketAtual.messages.length % 2 === 0) {
            alert("Aguarde a resposta do cliente.");
            return;
        }
        
        if(reportDiv) reportDiv.classList.add("display-none");
        
        const newMessage = document.getElementById("nova-mensagem");
        if (!newMessage || !newMessage.value.trim()) {
            return;
        }
        
        sendNewMessage(ticketAtual, newMessage.value);
        
        // Opcional: Atualizar status automaticamente ao responder
        const statusSelecionado = [...document.querySelectorAll(".status-opcao")].filter(el => el.classList.length > 1);
        if(statusSelecionado.length > 0) {
            updateTicketStatus(ticketAtual.id, statusSelecionado[0].getAttribute("status"));
        }
        
        newMessage.value = "";
    });
}