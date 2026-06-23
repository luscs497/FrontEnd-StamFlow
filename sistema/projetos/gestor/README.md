# Painel do Gestor — Power Dash AI (Next.js)

Faithful, pixel-perfect migration of the original `index.html` single-page
dashboard to a production-ready Next.js (App Router) application. Layout,
spacing, typography, colors, animations, responsiveness, and all interactive
behavior are preserved 1:1 with the original.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

## Project structure

```
app/
  layout.js                 Root layout. Reproduces the original <head> exactly:
                            the six media-query-scoped stylesheets, Google Fonts,
                            and the external CDN libraries, in the original order.
  page.js                   The full dashboard markup, converted 1:1 from the
                            original index.html <body> to JSX. Client Component.
  components/
    LegacyScripts.js        Loads the four original scripts in order and re-fires
                            DOMContentLoaded so their init runs under the React/
                            Next lifecycle.
public/
  styles/                   The six original CSS files, byte-for-byte.
  scripts/                  The four original JS files, byte-for-byte.
  images/                   Logo and default user image.
```

## Migration notes (what changed and why)

The original is a **single-page app** — the three views (Statistics, Reports,
Collaborators) are toggled with `display-none` by `script.js`, not separate
routes. The migration keeps this as a single page.

**Fidelity-first decisions:**

- **CSS is preserved verbatim** and loaded through the exact same media-query
  `<link>` tags as the original (breakpoints: 1501+, ≤1500, ≤1200, ≤992, ≤768,
  ≤468). It was intentionally **not** rewritten in Tailwind or CSS Modules, to
  guarantee identical cascade and rendering.
- **Markup is reproduced 1:1.** The original body was converted to JSX
  (`class`→`className`, inline `style` strings → objects, void/SVG elements
  self-closed, SVG attributes camelCased). No copy, structure, or spacing
  changed. The only edits: image `src` paths now point to `/images/`, and one
  duplicate `class` attribute on the hamburger SVG (which browsers silently
  ignore but JSX rejects) was de-duplicated. Neither affects rendering.
- **Original JS runs unchanged.** The four files are byte-for-byte copies. Three
  wrap their init in `DOMContentLoaded`, which has already fired by the time
  client scripts load in Next, so `LegacyScripts.js` loads them sequentially in
  the original order and re-dispatches `DOMContentLoaded`. All listeners,
  dropdowns, modals, the period-comparison view, tickets, and the collaborators
  mock initialize exactly as before.

**Carried over as-is from the original:**

- The external CDN libraries (face-api, mediapipe, swiper) are loaded as in the
  original even though the four scripts don't reference them.
- API calls target `api.stamflow.com.br` and the login redirect is commented out
  (as in the source), so the dashboard degrades gracefully without the backend.
```
