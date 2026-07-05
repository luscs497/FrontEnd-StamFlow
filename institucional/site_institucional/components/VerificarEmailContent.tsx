"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { API_BASE, LOGIN_URL } from "@/lib/config";

type Status = "loading" | "success" | "already" | "error";

export function VerificarEmailContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link inválido. Tente novamente a partir do e-mail que enviamos.");
      return;
    }
    fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (res.ok) {
          const msg: string = data?.message ?? "";
          if (msg.includes("já verificado")) {
            setStatus("already");
          } else {
            setStatus("success");
          }
          setMessage(msg);
        } else {
          setStatus("error");
          setMessage(data?.detail ?? "Link inválido ou expirado.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Não foi possível conectar ao servidor. Tente de novo em instantes.");
      });
  }, [token]);

  const config: Record<Status, { icon: React.ReactNode; title: string; color: string }> = {
    loading: {
      icon: <Spinner />,
      title: "Verificando…",
      color: "text-slatey",
    },
    success: {
      icon: <CheckIcon />,
      title: "E-mail verificado!",
      color: "text-signal",
    },
    already: {
      icon: <CheckIcon />,
      title: "Tudo certo!",
      color: "text-signal",
    },
    error: {
      icon: <ErrorIcon />,
      title: "Link inválido ou expirado",
      color: "text-raio",
    },
  };

  const { icon, title, color } = config[status];

  return (
    <main className="relative flex min-h-[80vh] items-center overflow-hidden py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-raio/10 blur-[120px]"
      />
      <div className="relative mx-auto max-w-[42rem] px-6 text-center sm:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-2xl border border-hairline bg-surface/60"
        >
          {icon}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className={`font-display text-4xl font-bold sm:text-5xl ${color}`}
        >
          {title}
        </motion.h1>

        {message && status !== "loading" && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-slatey"
          >
            {message}
          </motion.p>
        )}

        {(status === "success" || status === "already") && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9"
          >
            <a href={LOGIN_URL} className="btn-primary px-8 py-4 text-base">
              Entrar no painel
            </a>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <a href={LOGIN_URL} className="btn-ghost px-8 py-4 text-base">
              Ir para o login
            </a>
            <a href="/" className="btn-ghost px-8 py-4 text-base">
              Voltar ao site
            </a>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-signal">
      <path d="M4 12.5l4.5 4.5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-raio">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin text-slatey">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" strokeDasharray="50" strokeDashoffset="25" strokeLinecap="round" />
    </svg>
  );
}
