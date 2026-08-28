/**
 * Scripts carregados em runtime, divididos em DUAS FASES para acelerar a
 * exibição da tela inicial (onboarding/compliance):
 *
 *   FASE 1 (rápida) — Swiper + auth + script.js. É o mínimo para renderizar o
 *   onboarding e a interface. O Swiper controla o carrossel de compliance;
 *   script.js inicializa modais, áudios e o próprio onboarding. Nenhum deles
 *   depende das bibliotecas de visão computacional.
 *
 *   FASE 2 (pesada, adiada) — face-api + MediaPipe (holistic, camera_utils,
 *   drawing_utils) + camera.js + relatórios + notificações. São megabytes de
 *   libs de IA que só são necessários quando a CÂMERA liga — não para mostrar
 *   a tela de compliance. Carregar isso depois evita que o onboarding fique
 *   "travado" esperando ~1MB de scripts de IA baixarem em série.
 *
 * A ordem DENTRO de cada fase é preservada (carregamento sequencial), pois
 * camera.js depende de faceapi/Holistic/drawConnectors already defined.
 */

// Fase 1 — carrega primeiro, destrava o onboarding rapidamente.
export const LEGACY_SCRIPTS_CORE: string[] = [
  "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",
  "/scripts/auth.js",
  "/scripts/script.js",
];

// Fase 2 — libs de visão + câmera, carregadas logo em seguida (não bloqueiam
// a primeira pintura do onboarding).
export const LEGACY_SCRIPTS_HEAVY: string[] = [
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
  "/scripts/camera.js",
  "/scripts/get-repots.js",
  "/scripts/notifications.js",
  // Aba Detox Mental. html2canvas e jsPDF só são usados na exportação do quadro
  // (PNG/PDF); ficam na fase pesada por isso. São libs isoladas, sem reset
  // global — ao contrário do Tailwind, que foi eliminado do runtime.
  //
  // Servidas pelo jsDelivr, não pelo cdnjs: a CSP do .htaccess libera apenas
  // 'self' e cdn.jsdelivr.net em script-src. Pelo cdnjs (como vinha o artefato
  // original) o navegador bloqueia os dois em produção e os downloads PNG/PDF
  // param de funcionar — o dev server não tem CSP, então isso só aparece no ar.
  "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
  "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
  "/scripts/detox.js",
];

// Mantém compatibilidade: lista completa na ordem final (core → heavy).
export const LEGACY_SCRIPTS: string[] = [
  ...LEGACY_SCRIPTS_CORE,
  ...LEGACY_SCRIPTS_HEAVY,
];

/*
  Versão dos assets legados (/public/scripts).

  Diferente dos bundles do Next, esses arquivos são servidos com URL fixa, sem
  hash no nome — então o navegador e o cache do Hostinger continuam entregando a
  cópia antiga depois de um deploy. Foi isso que deixou o botão de colapso da
  sidebar inerte em produção no gestor: o CSS novo chegava e o script.js velho,
  sem o handler do clique, permanecia em cache.

  BUMPAR A CADA DEPLOY que altere qualquer arquivo em /public/scripts ou
  /public/data (o script.js versiona o fetch dos JSON com esta mesma chave).
*/
export const ASSET_VERSION = "20260827l";

/** Anexa ?v= apenas a assets locais (CDNs já versionam na própria URL). */
export function comVersao(src: string): string {
  if (!src.startsWith("/")) return src;
  return `${src}${src.includes("?") ? "&" : "?"}v=${ASSET_VERSION}`;
}
