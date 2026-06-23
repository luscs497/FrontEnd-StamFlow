import type { Config } from "tailwindcss";

/**
 * Sistema de tokens do StamFlow.
 * Paleta enxuta (3–4 cores): base escura + texto neutro + o "raio" (gradiente de marca)
 * + verde de acento positivo. O gradiente é usado com parcimônia, como assinatura.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base escura (já usada em todos os apps do produto)
        ink: "#0b1120",
        surface: "#0f172a",
        "surface-2": "#131d33",
        // Neutros de texto
        cloud: "#f8fafc",
        slatey: "#94a3b8",
        muted: "#64748b",
        // Bordas sutis
        hairline: "rgba(51, 65, 85, 0.7)",
        // Acento positivo
        signal: "#34d399",
        // Cores da marca, extraídas da logo (chama fria: ciano → azul → violeta).
        // Uso pontual; o gradiente é a assinatura.
        brand: {
          cyan: "#38bdf8",
          blue: "#3b82f6",
          indigo: "#6366f1",
          violet: "#7c3aed",
          // pontinha quente da chama — usada SÓ no mark da logo, não nas superfícies grandes
          ember: "#fb7185",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Escala de display ousada (referência Happly)
        "mega": ["clamp(3rem, 11vw, 9.5rem)", { lineHeight: "0.92", letterSpacing: "-0.04em" }],
        "giant": ["clamp(2.5rem, 6.4vw, 5rem)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
        "huge": ["clamp(2.25rem, 5vw, 3.875rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
      },
      borderRadius: {
        card: "24px",
        field: "12px",
      },
      backgroundImage: {
        // Gradiente da marca — ciano de entrada, mas o corpo e a saída são roxo.
        raio: "linear-gradient(100deg, #38bdf8 0%, #7c3aed 52%, #a855f7 100%)",
        "raio-soft":
          "linear-gradient(100deg, rgba(56,189,248,0.16), rgba(124,58,237,0.20), rgba(168,85,247,0.18))",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,189,248,0.12), 0 24px 60px -24px rgba(124,58,237,0.45)",
        lift: "0 24px 48px -28px rgba(0,0,0,0.7)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.78)" },
        },
        "drift": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2.2s ease-in-out infinite",
        drift: "drift 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
