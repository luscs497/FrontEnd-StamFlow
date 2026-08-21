/* faq.js - FAQ do Painel do Gestor
   Carrega /data/faq.json: dúvidas operacionais sobre como usar e entender
   as funcionalidades do próprio painel do gestor (diferente do
   compliance.js, que trata de como conduzir temas trazidos pelos
   colaboradores em Reports). Monta uma lista de categorias com itens que
   expandem/colapsam ao clicar — mesmo padrão de accordion já usado em
   Treinamento Compliance e nos outros painéis (seta gira, conteúdo
   expande).

   Além do accordion, esta aba tem:
   - Farol de gravidade: a cor do título da categoria vem da POSIÇÃO dela no
     JSON (1 = verde/trivial, 2 a 7 = amarelo/gestão-RH, 8 = vermelho/grave),
     espelhando a matriz de triagem de 3 TAGs do Treinamento Compliance.
   - Busca em tempo real sem acento e sem case sensitivity.
   - Botão "Copiar feedback", que copia o texto original (com \n) para o
     gestor colar já formatado no ticket.
*/

(function () {
  const CORES_VALIDAS = ["red", "orange", "blue", "green", "purple"];

  function corSegura(cor) {
    return CORES_VALIDAS.includes(cor) ? cor : "blue";
  }

  /* Farol de gravidade — a cor sai do índice da categoria, não do campo
     "cor" do JSON: o faq.json está ordenado do tema mais trivial
     (infraestrutura) para o mais grave (abusos e crimes), na mesma escala
     Verde / Amarelo / Vermelho da triagem de compliance. Categorias além da
     8ª (se o JSON crescer) caem no "cor" declarado, para não inventar
     gravidade onde a escala não alcança. */
  function corDoFarol(indice, categoria) {
    if (indice === 0) return "green";
    if (indice >= 1 && indice <= 6) return "orange";
    if (indice === 7) return "red";
    return corSegura(categoria && categoria.cor);
  }

  const SVG_NS = "http://www.w3.org/2000/svg";

  /* Busca: minúsculas + sem acento, para "assedio" achar "Assédio". */
  function normalizar(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escaparHtml(texto) {
    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* O JSON guarda as quebras como \n; na tela viram <br> (o CSS da resposta
     usa white-space: normal justamente por isso). O texto original fica
     intacto no dataset para a cópia. */
  function textoComQuebras(texto) {
    return escaparHtml(texto).replace(/\n/g, "<br>");
  }

  /* Toda resposta do faq.json tem o formato "O que é: ... \n\n Feedback
     sugerido: ...". O que interessa no ticket é só o trecho do feedback;
     sem o marcador, copia a resposta inteira. */
  function extrairFeedback(resposta) {
    const texto = String(resposta || "");
    const marcador = texto.match(/Feedback sugerido:\s*/i);
    if (!marcador) return texto.trim();
    return texto.slice(marcador.index + marcador[0].length).trim();
  }

  function criarSeta() {
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
    return seta;
  }

  function criarBotaoCopiar(textoOriginal) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "faq-copiar-feedback";
    botao.textContent = "Copiar feedback";

    botao.addEventListener("click", (evento) => {
      // O botão vive dentro do bloco da resposta, que fica sob o header
      // clicável do accordion — sem o stop o clique fecharia o item.
      evento.stopPropagation();

      const avisar = (texto, erro) => {
        botao.textContent = texto;
        botao.classList.toggle("faq-copiar-erro", Boolean(erro));
        setTimeout(() => {
          botao.textContent = "Copiar feedback";
          botao.classList.remove("faq-copiar-erro");
        }, 2000);
      };

      // writeText recebe o texto original, com os \n preservados, para o
      // gestor colar no ticket já quebrado em parágrafos.
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        avisar("Cópia indisponível", true);
        return;
      }

      navigator.clipboard
        .writeText(textoOriginal)
        .then(() => avisar("Copiado!"))
        .catch((err) => {
          console.error("Erro ao copiar feedback:", err);
          avisar("Não foi possível copiar", true);
        });
    });

    return botao;
  }

  function criarItemFaq(item, cor) {
    const li = document.createElement("li");
    li.className = "faq-item";

    const header = document.createElement("div");
    header.className = `faq-item-header ${cor}`;
    header.setAttribute("aria-expanded", "false");

    const h3 = document.createElement("h3");
    h3.textContent = item.pergunta;

    const seta = criarSeta();

    header.appendChild(h3);
    header.appendChild(seta);

    const resposta = document.createElement("div");
    resposta.className = "faq-item-resposta display-none";

    const texto = document.createElement("p");
    texto.className = "faq-item-texto";
    texto.innerHTML = textoComQuebras(item.resposta);
    resposta.appendChild(texto);
    resposta.appendChild(criarBotaoCopiar(extrairFeedback(item.resposta)));

    const alternar = (abrir) => {
      const abrindo =
        typeof abrir === "boolean"
          ? abrir
          : resposta.classList.contains("display-none");
      resposta.classList.toggle("display-none", !abrindo);
      seta.classList.toggle("faq-details-aberto", abrindo);
      header.setAttribute("aria-expanded", String(abrindo));
    };

    header.addEventListener("click", () => alternar());

    li.appendChild(header);
    li.appendChild(resposta);

    // Índice de busca pronto: título + resposta já normalizados, para o
    // keyup não pagar normalize() em 50 itens a cada tecla.
    li._faqBusca = normalizar(`${item.pergunta} ${item.resposta}`);
    li._faqAlternar = alternar;
    return li;
  }

  function criarCategoria(categoria, indice) {
    const li = document.createElement("li");
    li.className = "faq-categoria gap-16";

    const cor = corDoFarol(indice, categoria);

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
    li._faqBusca = normalizar(categoria.categoria);
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

    dados.forEach((categoria, indice) => {
      container.appendChild(criarCategoria(categoria, indice));
    });
  }

  function filtrarFaq(termoBruto) {
    const container = document.getElementById("lista-faq");
    if (!container) return;

    const vazio = document.getElementById("faq-sem-resultados");
    // Busca avançada: cada palavra é um filtro, e o item só aparece se
    // casar com todas ("assedio moral" não traz tudo que tem "moral").
    const termos = normalizar(termoBruto).split(/\s+/).filter(Boolean);
    const buscando = termos.length > 0;
    let visiveis = 0;

    container.querySelectorAll(".faq-categoria").forEach((categoria) => {
      const categoriaCasa =
        buscando && termos.every((t) => (categoria._faqBusca || "").includes(t));
      let itensVisiveis = 0;

      categoria.querySelectorAll(".faq-item").forEach((item) => {
        // Casar pelo nome da categoria mantém a categoria inteira à vista.
        const casa =
          !buscando ||
          categoriaCasa ||
          termos.every((t) => (item._faqBusca || "").includes(t));

        item.classList.toggle("display-none", !casa);
        if (casa) itensVisiveis += 1;

        // Durante a busca o match costuma estar no corpo da resposta —
        // abrir o item evita "resultado" que não mostra o que casou.
        if (typeof item._faqAlternar === "function") {
          item._faqAlternar(buscando && casa);
        }
      });

      categoria.classList.toggle("display-none", itensVisiveis === 0);
      visiveis += itensVisiveis;
    });

    if (vazio) vazio.classList.toggle("display-none", !buscando || visiveis > 0);
  }

  function ligarBusca() {
    const input = document.getElementById("search-faq");
    if (!input || input.dataset.ligado === "true") return;

    input.addEventListener("input", () => filtrarFaq(input.value));
    // Esc limpa a busca sem obrigar o gestor a apagar tecla a tecla.
    input.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") {
        input.value = "";
        filtrarFaq("");
      }
    });

    input.dataset.ligado = "true";
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

        // Se o gestor já tinha digitado antes do fetch terminar, o filtro
        // precisa valer para o conteúdo recém-montado.
        const input = document.getElementById("search-faq");
        if (input && input.value) filtrarFaq(input.value);
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

    ligarBusca();

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
