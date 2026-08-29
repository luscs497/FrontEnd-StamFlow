/*
  Versão dos assets legados (/public/scripts e /public/styles).

  Diferente dos bundles do Next, esses arquivos são servidos com URL fixa, sem
  hash no nome — então o navegador e o cache do Hostinger continuam entregando a
  cópia antiga depois de um deploy. Foi exatamente isso que deixou o botão de
  colapso da sidebar inerte em produção: o CSS novo chegava e o script.js velho,
  sem o handler do clique, permanecia em cache.

  BUMPAR A CADA DEPLOY que altere qualquer arquivo em /public/scripts ou
  /public/styles. O formato é livre; a data facilita rastrear.
*/
export const ASSET_VERSION = "20260829";

/** Anexa ?v= apenas a assets locais (CDNs já versionam na própria URL). */
export function comVersao(src) {
  if (!src.startsWith("/")) return src;
  return `${src}${src.includes("?") ? "&" : "?"}v=${ASSET_VERSION}`;
}
