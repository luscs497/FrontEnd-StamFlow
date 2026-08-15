# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

This is **not a single app** — it's a collection of independent Next.js projects for the StamFlow product, each with its own `package.json`, no shared root tooling (no workspaces, no turborepo, no root `package.json`). Always `cd` into the specific project directory before running `npm install`/`npm run *`.

```
institucional/site_institucional/   Public marketing site (statically exported)
sistema/projetos/login/             Login / auth portal (login.stamflow.com.br)
sistema/projetos/gestor/            Manager dashboard (gestor.stamflow.com.br)
sistema/projetos/user/              Employee/user dashboard (user.stamflow.com.br)
sistema/projetos/avulso/            Standalone/individual-subscriber dashboard (painel.stamflow.com.br)
sistema/projetos/demo/              Demo variant of the user dashboard
sistema/out/                        Zipped production build outputs (artifacts, not source)
```

## Commands

Every project uses the standard Next.js scripts; run from inside that project's directory:

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
```

- `user`, `avulso`, `demo`: Next 14.2.x + TypeScript, Node 18.18+ required.
- `gestor`: Next 15.1.6 + React 19, plain JS (no TypeScript).
- `login`: Next 14.2.5 + TypeScript.
- `institucional/site_institucional`: Next 14.2.15 + TypeScript + Tailwind + Framer Motion, builds with `output: "export"` — `npm run build` produces static output in `out/` for static hosting (Hostinger), there is no server runtime in production.

There is no test runner configured in any project; correctness is currently verified by running the dev server and exercising the UI manually.

## Architecture: legacy-migration dashboards (gestor, user, avulso, demo)

These four projects are **pixel-perfect, behavior-preserving migrations** of a pre-existing single-page HTML/CSS/JS dashboard (originally `index.html` + imperative scripts), not fresh React rewrites. This constraint drives most of their structure and should not be "cleaned up" into idiomatic React without understanding why:

- The legacy `<body>` markup is preserved byte-for-byte (in `gestor` it's converted 1:1 to JSX in `app/page.js`; in `user`/`avulso`/`demo` it's kept as raw HTML in `app/_legacy/app-body.html` and injected via `dangerouslySetInnerHTML` inside a Server Component, `components/LegacyMarkup.tsx`).
- That markup is wrapped in a `display: contents` container so it adds no layout box — the original `<header>`/`<section>` elements become direct flex children of `<body>`, matching the legacy `body { display: flex }` CSS exactly.
- The legacy CSS files are preserved verbatim under `public/styles/` and concatenated/media-query-wrapped into a single `app/globals.css` in the original cascade order (base stylesheet unwrapped, then each breakpoint file wrapped in its original `@media` query) — this is intentional and byte-order-sensitive, not something to reorganize.
- The legacy scripts (`script.js`, `camera.js`, `get-repots.js`, etc., plus external CDN libs like face-api, MediaPipe Holistic, Swiper) are loaded byte-for-byte from `public/scripts/` via a client bootstrap component (`components/LegacyScripts.js` / `LegacyBootstrap.tsx`, ordered by `lib/scripts.ts`), which loads them sequentially in the original order and **re-dispatches `DOMContentLoaded`/`load`** once loading completes, since those events already fired before Next.js hydration. A `window.__stamflowBooted` guard prevents double-boot. React never re-renders this subtree — the legacy scripts own the DOM directly.
- `next/font` is deliberately **not** used for the Inter webfont (it generates a randomized font-family name that the legacy CSS's hard-coded `font-family: 'Inter'` couldn't match); it's loaded via a plain `<link>` instead, with the `no-page-custom-font` lint rule disabled on purpose.
- All backend calls target `https://api.stamflow.com.br/...` with cookie-based sessions; without a live backend/session these calls fail gracefully exactly as the legacy app did standalone.

Despite sharing this architecture, `gestor`, `user`, `avulso`, and `demo` are **separate apps with diverging script/behavior logic**, not copies that stay in sync — e.g. `demo` has an extra `demo-gate.js`, `user` has an extra `tickets.js`, and each has its own `script.js`. Check each project's own `public/scripts/` and README before assuming behavior matches another sibling project.

## Architecture: login (sistema/projetos/login)

Auth portal at `login.stamflow.com.br`. Key routes: `/login`, `/register` (requires an admin token in the header), `/reset-password` (token via `?token=` query param). Post-login redirect target depends on user type:

| User type | Redirect |
|---|---|
| `manager` | `gestor.stamflow.com.br` |
| `client` with a company | `user.stamflow.com.br` |
| `client` without a company | `painel.stamflow.com.br` |

All auth endpoints live under `https://api.stamflow.com.br/auth/*` (login, register, forgot-password, reset-password).

## Architecture: institucional/site_institucional

Marketing/landing site only — **no logged-in area of its own**; login and signup happen on the external `login.stamflow.com.br` app, this site only links out to it (`lib/config.ts` → `LOGIN_URL`). Statically exported for hosting on Hostinger.

- `lib/config.ts` centralizes every external integration point (API base, auth/plan/enterprise endpoints, sales WhatsApp number, trial length, nav links) even though everything is currently mocked — treat this file as the single source of truth before wiring up real backend calls.
- `lib/plans.ts` mocks the plans fetch with simulated loading/error/success states (`SIMULATE_ERROR` flag to preview the error state).
- `components/Providers.tsx` supplies the context that opens the trial/enterprise modals (`TrialModal.tsx`, `EnterpriseModal.tsx`); the enterprise flow currently builds a `wa.me` link client-side rather than calling the backend.
- Real integration points to eventually wire up: `POST /auth/register` → `POST /subscription/trial/start` (trial signup), `GET /subscription_plan/plans?type=individual` (plans), `POST /enterprise/request` (enterprise contact, returns a wa.me link).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
