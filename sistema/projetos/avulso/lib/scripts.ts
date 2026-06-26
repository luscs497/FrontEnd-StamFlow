/**
 * Ordered list of scripts to load at runtime — mirrors the EXACT load order
 * of the original index.html:
 *   <head>  face-api, holistic, camera_utils, drawing_utils
 *   <body>  swiper-bundle, script.js, camera.js, get-repots.js
 *
 * Loading is performed sequentially (each awaited before the next) so every
 * global a later script depends on (faceapi, Holistic, Camera, drawConnectors,
 * Swiper, …) is defined first — identical to synchronous <script> parsing.
 */
export const LEGACY_SCRIPTS: string[] = [
  // External CDN libraries (originally in <head>)
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
  // Swiper (originally first script at end of <body>)
  "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",
  // Auth layer (must load before all app scripts)
  "/scripts/auth.js",
  // Local application scripts (served from /public/scripts)
  "/scripts/script.js",
  "/scripts/camera.js",
  "/scripts/get-repots.js",
  "/scripts/notifications.js",
];
