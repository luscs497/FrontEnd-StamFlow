/* compliance.js - Treinamento Compliance
   Carrega /data/compliance.json: temas reais que colaboradores costumam
   trazer em Reports (financeiro, relacionamento, operacional, políticas
   internas), cada um com uma orientação de como o gestor deve conduzir e
   responder aquele tipo de caso. Monta uma lista de categorias com itens
   que expandem/colapsam ao clicar — mesmo padrão de accordion já usado
   nos outros painéis (seta gira, conteúdo expande).
*/

(function () {
  const CORES_VALIDAS = ["red", "orange", "blue", "green", "purple"];

  function corSegura(cor) {
    return CORES_VALIDAS.includes(cor) ? cor : "red";
  }

  const SVG_NS = "http://www.w3.org/2000/svg";

  function criarItemFaq(item, cor) {
    const li = document.createElement("li");
    li.className = "compliance-item";

    const header = document.createElement("div");
    header.className = `compliance-item-header ${cor}`;

    const h3 = document.createElement("h3");
    h3.textContent = item.pergunta;

    // SVG criado dinamicamente precisa de createElementNS — com
    // document.createElement("svg") o navegador cria a tag no namespace
    // HTML, e ela nunca é renderizada como gráfico vetorial.
    const seta = document.createElementNS(SVG_NS, "svg");
    seta.setAttribute("width", "20");
    seta.setAttribute("height", "20");
    seta.setAttribute("viewBox", "0 0 24 24");
    seta.setAttribute("fill", "none");
    seta.setAttribute("stroke", "currentColor");
    seta.setAttribute("stroke-width", "2");
    seta.setAttribute("stroke-linecap", "round");
    seta.setAttribute("stroke-linejoin", "round");
    seta.classList.add("abrir-compliance-details");

    const polyline = document.createElementNS(SVG_NS, "polyline");
    polyline.setAttribute("points", "6 9 12 15 18 9");
    seta.appendChild(polyline);

    header.appendChild(h3);
    header.appendChild(seta);

    const resposta = document.createElement("p");
    resposta.className = "compliance-item-resposta display-none";
    resposta.textContent = item.resposta;

    header.addEventListener("click", () => {
      const abrindo = resposta.classList.contains("display-none");
      resposta.classList.toggle("display-none", !abrindo);
      seta.classList.toggle("compliance-details-aberto", abrindo);
    });

    li.appendChild(header);
    li.appendChild(resposta);
    return li;
  }

  function criarCategoria(categoria) {
    const li = document.createElement("li");
    li.className = "compliance-categoria gap-16";

    const cor = corSegura(categoria.cor);

    const titulo = document.createElement("h2");
    titulo.className = cor;
    titulo.textContent = categoria.categoria;
    li.appendChild(titulo);

    const lista = document.createElement("ul");
    lista.className = "compliance-lista-itens gap-8";

    (categoria.itens || []).forEach((item) => {
      lista.appendChild(criarItemFaq(item, cor));
    });

    li.appendChild(lista);
    return li;
  }

  function renderCompliance(dados) {
    const container = document.getElementById("lista-compliance");
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(dados) || dados.length === 0) {
      const vazio = document.createElement("p");
      vazio.style.color = "#888";
      vazio.textContent = "Nenhum conteúdo disponível no momento.";
      container.appendChild(vazio);
      return;
    }

    dados.forEach((categoria) => {
      container.appendChild(criarCategoria(categoria));
    });
  }

  function carregarCompliance() {
    const container = document.getElementById("lista-compliance");
    if (!container || container.dataset.carregado === "true") return;

    fetch("/data/compliance.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((dados) => {
        renderCompliance(dados);
        container.dataset.carregado = "true";
      })
      .catch((err) => console.error("Erro ao carregar compliance.json:", err));
  }

  function init() {
    // O link "Treinamento Compliance" é identificado pelo title (igual o
    // resto da navegação do gestor usa o atributo title para o cabeçalho).
    const link = document.querySelector('[title="Compliance Training"]');
    if (link) {
      link.addEventListener("click", carregarCompliance);
    }

    // Se a seção já estiver visível no load (ex.: navegação direta), carrega
    // de imediato em vez de esperar um clique que não vai acontecer.
    const secoes = document.querySelectorAll(".conteudo-site");
    secoes.forEach((sec) => {
      if (sec.querySelector("#lista-compliance") && !sec.classList.contains("display-none")) {
        carregarCompliance();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("painelGestorReady", init);
})();
