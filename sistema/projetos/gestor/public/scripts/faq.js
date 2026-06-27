/* faq.js - FAQ do Painel do Gestor
   Carrega /data/faq.json: dúvidas operacionais sobre como usar e entender
   as funcionalidades do próprio painel do gestor (diferente do
   compliance.js, que trata de como conduzir temas trazidos pelos
   colaboradores em Reports). Monta uma lista de categorias com itens que
   expandem/colapsam ao clicar — mesmo padrão de accordion já usado em
   Treinamento Compliance e nos outros painéis (seta gira, conteúdo
   expande).
*/

(function () {
  const CORES_VALIDAS = ["red", "orange", "blue", "green", "purple"];

  function corSegura(cor) {
    return CORES_VALIDAS.includes(cor) ? cor : "blue";
  }

  const SVG_NS = "http://www.w3.org/2000/svg";

  function criarItemFaq(item, cor) {
    const li = document.createElement("li");
    li.className = "faq-item";

    const header = document.createElement("div");
    header.className = `faq-item-header ${cor}`;

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
    seta.classList.add("abrir-faq-details");

    const polyline = document.createElementNS(SVG_NS, "polyline");
    polyline.setAttribute("points", "6 9 12 15 18 9");
    seta.appendChild(polyline);

    header.appendChild(h3);
    header.appendChild(seta);

    const resposta = document.createElement("p");
    resposta.className = "faq-item-resposta display-none";
    resposta.textContent = item.resposta;

    header.addEventListener("click", () => {
      const abrindo = resposta.classList.contains("display-none");
      resposta.classList.toggle("display-none", !abrindo);
      seta.classList.toggle("faq-details-aberto", abrindo);
    });

    li.appendChild(header);
    li.appendChild(resposta);
    return li;
  }

  function criarCategoria(categoria) {
    const li = document.createElement("li");
    li.className = "faq-categoria gap-16";

    const cor = corSegura(categoria.cor);

    const titulo = document.createElement("h2");
    titulo.className = cor;
    titulo.textContent = categoria.categoria;
    li.appendChild(titulo);

    const lista = document.createElement("ul");
    lista.className = "faq-lista-itens gap-8";

    (categoria.itens || []).forEach((item) => {
      lista.appendChild(criarItemFaq(item, cor));
    });

    li.appendChild(lista);
    return li;
  }

  function renderFaq(dados) {
    const container = document.getElementById("lista-faq");
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

  function carregarFaq() {
    const container = document.getElementById("lista-faq");
    if (!container || container.dataset.carregado === "true") return;

    fetch("/data/faq.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((dados) => {
        renderFaq(dados);
        container.dataset.carregado = "true";
      })
      .catch((err) => console.error("Erro ao carregar faq.json:", err));
  }

  function init() {
    // O link "FAQ" é identificado pelo title (igual o resto da navegação
    // do gestor usa o atributo title para o cabeçalho).
    const link = document.querySelector('[title="FAQ Painel Gestor"]');
    if (link) {
      link.addEventListener("click", carregarFaq);
    }

    // Se a seção já estiver visível no load (ex.: navegação direta), carrega
    // de imediato em vez de esperar um clique que não vai acontecer.
    const secoes = document.querySelectorAll(".conteudo-site");
    secoes.forEach((sec) => {
      if (sec.querySelector("#lista-faq") && !sec.classList.contains("display-none")) {
        carregarFaq();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("painelGestorReady", init);
})();
