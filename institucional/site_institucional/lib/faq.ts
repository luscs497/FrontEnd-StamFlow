export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = [
  {
    q: "O StamFlow envia o meu vídeo para algum servidor?",
    a: "Não. A leitura de postura e de expressão acontece inteiramente dentro do seu navegador. Nenhum quadro de vídeo, foto ou imagem sai do seu computador.",
  },
  {
    q: "Preciso instalar alguma coisa?",
    a: "Não. O StamFlow roda no navegador. Você concede acesso à câmera quando quiser usar a leitura, e pode revogar a qualquer momento. Sem extensão, sem download.",
  },
  {
    q: "Como faço para assinar?",
    a: "Na seção de planos, escolha o período que preferir e adicione ao carrinho. No checkout você cria sua conta (ou entra) e é levado ao pagamento seguro pelo Mercado Pago. A assinatura é recorrente e você pode cancelar quando quiser.",
  },
  {
    q: "Qual a diferença entre o plano individual e o empresarial?",
    a: "O individual é autoatendimento, com preço fixo e recorrente — ideal para uso pessoal. O empresarial é por número de licenças (colaboradores e gestores), com valor sob medida; por isso ele passa por uma conversa rápida em vez de uma tabela fixa.",
  },
  {
    q: "O gestor consegue ver os dados de cada pessoa da equipe?",
    a: "Não. A visão de empresa é agregada e pensada para bem-estar coletivo. O gestor acompanha tendências da equipe, nunca a leitura individual e sensível de cada colaborador.",
  },
  {
    q: "O que tem além da leitura de energia?",
    a: "Quatro trilhas guiadas: Exercícios (alongamentos, fortalecimento e oxigenação), Pausa Mental (respiração guiada mindfulness), Foco (trilhas ambientes para concentrar) e StamFlow University (resumos guiados sobre atenção, hábito e energia).",
  },
  {
    q: "Já tenho conta. Onde eu entro?",
    a: "No botão Entrar, no topo da página. Ele leva direto para o login do StamFlow, que reconhece se você é colaborador, avulso ou gestor e te encaminha para o painel certo.",
  },
];
