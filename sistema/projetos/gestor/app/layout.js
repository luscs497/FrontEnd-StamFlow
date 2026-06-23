import Script from "next/script";

export const metadata = {
  title: "Power Dash AI",
  description:
    "Power Dash AI - Monitor your productivity with stamina tracking, posture checks, guided exercises, and mental breaks. Optimize your well-being and focus.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/*
          Stylesheets are loaded exactly as in the original index.html:
          base stylesheet + media-query-scoped breakpoint stylesheets.
          They live in /public/styles and are referenced verbatim so the
          cascade and breakpoint behavior is byte-for-byte identical.
        */}
        <link rel="stylesheet" href="/styles/styles.css" />
        <link
          rel="stylesheet"
          href="/styles/styles.css"
          media="screen and (min-width: 1501px)"
        />
        <link
          rel="stylesheet"
          href="/styles/styles-1500.css"
          media="screen and (max-width: 1500px) and (min-width: 1201px)"
        />
        <link
          rel="stylesheet"
          href="/styles/styles-1200.css"
          media="screen and (max-width: 1200px) and (min-width: 993px)"
        />
        <link
          rel="stylesheet"
          href="/styles/styles-992.css"
          media="screen and (max-width: 992px) and (min-width: 769px)"
        />
        <link
          rel="stylesheet"
          href="/styles/styles-768.css"
          media="screen and (max-width: 768px) and (min-width: 469px)"
        />
        <link
          rel="stylesheet"
          href="/styles/styles-468.css"
          media="screen and (max-width: 468px)"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />

        {/* External vendor libraries loaded in the original head (kept for
            parity; loaded before interactive so global script behavior is
            unchanged). */}
        <Script
          src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
          strategy="beforeInteractive"
        />
      </head>
      {/*
        suppressHydrationWarning on <body>:

        Some browser extensions (ColorZilla adds `cz-shortcut-listen`,
        Grammarly adds `data-gr-ext-installed`, etc.) inject attributes
        onto the <body> tag in the browser before React's hydration
        completes. The injected attributes don't exist in the server-
        rendered HTML, so React logs a hydration mismatch warning even
        though there's nothing wrong with the application's own markup.

        This flag tells React not to compare DOM attributes of <body>
        across the SSR/client boundary. It does NOT silence mismatches
        inside the page content (children still hydrate normally and
        warn on legitimate mismatches). A scan of the app showed no
        project-side hydration risks (no `Date.now()`, `Math.random()`,
        locale-dependent rendering, `typeof window` checks, generated
        IDs, or invalid nesting in the rendered JSX — and all
        browser-only logic lives inside `useEffect` in LegacyScripts).
      */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
