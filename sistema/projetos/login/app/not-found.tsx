export default function NotFound() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        boxSizing: "border-box",
        background: "#0f172a",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <p style={{ fontSize: "clamp(64px, 18vw, 88px)", fontWeight: 800, color: "#7c3aed", margin: "0 0 8px", lineHeight: 1 }}>
        404
      </p>
      <h1 style={{ fontSize: "clamp(22px, 6vw, 28px)", fontWeight: 700, margin: "0 0 12px", color: "#f1f5f9" }}>
        Página não encontrada
      </h1>
      <p style={{ fontSize: "clamp(14px, 4vw, 16px)", color: "#94a3b8", maxWidth: "380px", lineHeight: 1.6, margin: "0 0 32px" }}>
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <a
        href="https://login.stamflow.com.br"
        style={{
          background: "#7c3aed",
          color: "#fff",
          fontWeight: 600,
          fontSize: "15px",
          padding: "14px 32px",
          borderRadius: "999px",
          textDecoration: "none",
          // 44px reais de alvo de toque. O projeto aplica html { zoom: 0.8 },
          // entao o minimo vira 44 / 0.8 = 55px de CSS (ver bloco R14).
          minHeight: "55px",
          boxSizing: "border-box",
          alignItems: "center",
          display: "inline-flex",
        }}
      >
        Voltar ao login
      </a>
    </div>
  );
}
