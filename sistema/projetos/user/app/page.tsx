import LegacyMarkup from "@/components/LegacyMarkup";
import LegacyBootstrap from "@/components/LegacyBootstrap";

export default function Home() {
  return (
    <>
      {/* Auth overlay — removido por script.js após sessão confirmada */}
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
