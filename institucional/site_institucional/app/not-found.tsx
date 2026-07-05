import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página não encontrada — StamFlow",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#0b1120", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
        <main style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "2rem",
        }}>
          <p style={{ fontSize: "80px", fontWeight: 800, color: "#7c3aed", margin: "0 0 8px", lineHeight: 1 }}>
            404
          </p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 12px", color: "#f1f5f9" }}>
            Página não encontrada
          </h1>
          <p style={{ fontSize: "16px", color: "#94a3b8", maxWidth: "380px", lineHeight: 1.6, margin: "0 0 36px" }}>
            O endereço que você tentou acessar não existe ou foi movido.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              background: "#7c3aed",
              color: "#fff",
              fontWeight: 600,
              fontSize: "15px",
              padding: "14px 32px",
              borderRadius: "999px",
              textDecoration: "none",
            }}
          >
            Voltar ao site principal
          </a>
        </main>
      </body>
    </html>
  );
}
