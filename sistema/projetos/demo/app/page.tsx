import LegacyMarkup from "@/components/LegacyMarkup";
import LegacyBootstrap from "@/components/LegacyBootstrap";

/**
 * The whole application is a single screen (the original was a one-page app
 * whose "routing" is just show/hide of `.conteudo-site` sections handled by
 * script.js). We render the original markup and then bootstrap the legacy
 * scripts. Both are direct children of <body>; LegacyMarkup's display:contents
 * wrapper makes the <header>/<section>s the real flex children.
 *
 * #auth-overlay: covers the entire screen until script.js confirms a valid
 * session. This prevents the dashboard content from being visible even for
 * a fraction of a second before the redirect fires.
 */
export default function Home() {
  return (
    <>
      {/* Auth overlay — hidden by script.js after session is confirmed */}
      <div
        id="auth-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src="/StamFlowLogo-removebg-preview.png"
            alt="StamFlow"
            style={{ width: 120, marginBottom: 24, opacity: 0.9 }}
          />
          <div style={{
            width: 36, height: 36, border: "3px solid #334155",
            borderTop: "3px solid #34d399", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto",
          }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      <LegacyMarkup />
      <LegacyBootstrap />
    </>
  );
}
