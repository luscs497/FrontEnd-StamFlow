# Power Dash AI (StamFlow) — Next.js migration

A **pixel-perfect, behavior-preserving** migration of the legacy HTML/CSS/JS app
to **Next.js (App Router) + TypeScript**. The goal was zero visual and zero
behavioral regressions, so the original markup, styles and runtime scripts are
preserved exactly and run inside a clean Next.js architecture.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm run start   # production
```

Requires Node 18.18+.

## Project structure

```
app/
  layout.tsx            Root layout: <head> font/Swiper links, global CSS, metadata
  page.tsx              Composes the legacy markup + script bootstrap
  globals.css           Consolidated stylesheet (see "Styling" below)
  _legacy/
    app-body.html       Original <body> markup (header + 3 sections), verbatim
components/
  LegacyMarkup.tsx      Server component: injects app-body.html (display:contents)
  LegacyBootstrap.tsx   Client component: ordered script loading + lifecycle events
lib/
  scripts.ts            Ordered external + local script list
public/
  scripts/              script.js, camera.js, get-repots.js, biometrics.worker.js
  styles/               Raw original CSS files (kept for reference/parity)
  data/                 exercicios.json, foco.json, mental.json, university.json
  assets/audios/        (audio drop-in folder — see "Known stubs")
  StamFlowLogo-removebg-preview.png   placeholder
  imagemdefaultusuario.png            placeholder
```

## Why this architecture (fidelity first)

The legacy app is a single-page, **imperative DOM** application: `script.js`,
`camera.js` and `get-repots.js` query elements by id/class, toggle
`display-none`, draw on a `<canvas>`, run a Web Worker, MediaPipe Holistic +
face-api, and Swiper. Rewriting ~1,400 lines of markup and ~1,500 lines of
imperative JS into idiomatic React state would be the single biggest source of
regressions. To guarantee identical output we instead:

- **Render the original `<body>` markup byte-for-byte** (`app/_legacy/app-body.html`)
  via `dangerouslySetInnerHTML`. Every element, class, id, inline SVG and the
  custom `categoria="…"` attributes are preserved exactly — no HTML→JSX
  attribute translation that could drift.
- Wrap it in a **`display: contents`** container so it produces no layout box:
  the `<header>` and three `<section>`s become **direct flex children of
  `<body>`**, matching the original `body { display: flex }` layout precisely.
- Keep that subtree in a **Server Component with no state**, so React never
  re-renders it and never fights the imperative DOM mutations. The legacy
  scripts own the DOM, exactly as before.

This honors the brief's explicit guidance to prioritize exact rendering over
abstraction while still delivering a clean, scalable App Router project
(reusable components, typed, `public/` assets, proper separation).

## Styling — exact responsive cascade

The original loaded **seven `<link>` stylesheets with `media` attributes**: a
base `styles.css` (always on) plus five breakpoint files, each active only in
its range. The override behavior depends on the base loading **first** and each
responsive file **after** it.

`app/globals.css` reproduces this deterministically: it concatenates the base
`styles.css` (unwrapped, always-on) followed by each responsive file **wrapped
in its original media query, in the original order**. This is byte-equivalent to
the legacy media-attribute links but immune to any link reordering, so the
desktop / 1500 / 1200 / 992 / 768 / 468 breakpoints — down to 350px — render
identically. The raw files are also kept under `public/styles/` for reference.

The Inter webfont is loaded by name via a `<link>` (as in the original) so the
hard-coded `font-family: 'Inter'` rules resolve to the exact same font. (We do
not use `next/font` here because it generates a randomized family name the
legacy CSS could not match — that would change rendering. The
`no-page-custom-font` lint rule is therefore disabled on purpose.)

## Script lifecycle — identical single boot

`LegacyBootstrap` reproduces the original load order and init timing:

1. Loads, strictly in order (each awaited): face-api, MediaPipe Holistic,
   camera_utils, drawing_utils, Swiper, then `script.js`, `camera.js`,
   `get-repots.js` — so every global a later script needs already exists.
2. Because `camera.js` reads the DOM at top level and the scripts init on
   `DOMContentLoaded` (`script.js`, `camera.js`) and window `load`
   (`get-repots.js`) — events that have already fired by the time client code
   runs in Next.js — it **re-dispatches those events once** after all scripts
   load, invoking each listener exactly once (matching the original boot).
3. A `window.__stamflowBooted` guard prevents any double boot.

The Web Worker is served at `/scripts/biometrics.worker.js` — the exact path
`camera.js` requests (`new Worker('/scripts/biometrics.worker.js')`).

## Backend / camera behavior (unchanged)

`camera.js` requests the webcam on load and the scripts call
`https://api.stamflow.com.br/...` with cookies, exactly like the original.
Without that backend/session these calls fail and are logged/handled by the
original code paths — identical to running the legacy app offline. Grant camera
permission to see the live posture/emotion pipeline.

## Known stubs (per migration scope)

- **Audio files**: the data JSON references `/assets/audios/*.mp3`. These binary
  files were not part of the input and were intentionally omitted. Drop the real
  `.mp3`s into `public/assets/audios/` using the referenced names to enable
  playback — the player wiring is fully migrated.
- **Images**: `StamFlowLogo-removebg-preview.png` and `imagemdefaultusuario.png`
  are **placeholders** (originals were not provided). Replace the files in
  `public/` with the real assets (same names) — no code changes needed.
