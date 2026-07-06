"use client";

import { motion } from "framer-motion";
import { LOGIN_URL } from "@/lib/config";

/**
 * Página exibida quando alguém sem assinatura ativa tenta acessar um painel.
 * Os painéis (login/avulso/user/gestor) redirecionam para cá em vez de para
 * o antigo painel demo. Mantém a estética do site e oferece dois caminhos:
 * ver os planos (converter) ou voltar ao site principal.
 */
export function SemAssinaturaContent() {
  return (
    <main className="relative flex min-h-[80vh] items-center overflow-hidden py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-raio/10 blur-[120px]"
      />
      <div className="relative mx-auto max-w-[46rem] px-6 text-center sm:px-10">
        <div className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-2xl border border-hairline bg-surface/60 text-brand-violet"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="5"
              y="10.5"
              width="14"
              height="9.5"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M8 10.5V7.5a4 4 0 018 0v3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="15" r="1.4" fill="currentColor" />
          </svg>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl font-bold leading-tight text-cloud sm:text-5xl"
        >
          Sua conta está <span className="text-raio">sem assinatura ativa</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slatey"
        >
          Para acessar o seu painel, você precisa de um plano ativo. Escolha o
          período que faz mais sentido para você e libere o StamFlow completo —
          leitura ao vivo, exercícios, foco, pausas e seus relatórios.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a href="/#planos" className="btn-primary px-8 py-4 text-base">
            Ver planos e assinar
          </a>
          <a href="/" className="btn-ghost px-8 py-4 text-base">
            Voltar ao site principal
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 text-sm text-muted"
        >
          Acha que isso é um engano?{" "}
          <a href={LOGIN_URL} className="text-slatey underline underline-offset-4 hover:text-cloud">
            Entrar com outra conta
          </a>
        </motion.p>
      </div>
    </main>
  );
}
