"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { LOGIN_URL } from "@/lib/config";

/**
 * Página exibida quando alguém com assinatura EXPIRADA ou CANCELADA tenta
 * acessar um painel (diferente de /sem_assinatura, que é para quem nunca teve
 * assinatura). O tom é de reconquista: "bem-vindo de volta, renove".
 *
 * O destino do CTA principal depende do perfil, informado pelo painel na URL:
 *   ?perfil=empresa  -> página de empresas (/empresas)
 *   ?perfil=avulso   -> planos individuais (/#planos)
 * Sem o parâmetro (acesso direto), mostramos os dois caminhos.
 */
export function AssinaturaExpiradaContent() {
  const params = useSearchParams();
  const perfil = params.get("perfil"); // "empresa" | "colaborador" | "avulso" | null

  const isEmpresa = perfil === "empresa";
  const isColaborador = perfil === "colaborador";
  const isAvulso = perfil === "avulso";
  const conhecido = isEmpresa || isColaborador || isAvulso;

  // Título e texto variam conforme quem é a pessoa.
  let titulo = (
    <>
      Que bom <span className="text-raio">te ver de volta!</span>
    </>
  );
  let descricao =
    "Parece que a sua assinatura expirou. Que tal renovar e voltar a acompanhar a sua energia, com tudo o que o StamFlow oferece?";

  if (isEmpresa) {
    descricao =
      "Parece que o plano da sua empresa expirou. Renove para que toda a equipe volte a acompanhar o bem-estar no dia a dia.";
  } else if (isColaborador) {
    titulo = (
      <>
        O plano da sua empresa <span className="text-raio">expirou.</span>
      </>
    );
    descricao =
      "Fale com o gestor da sua empresa para renovar o acesso da equipe — ou, se preferir, assine um plano individual e continue usando o StamFlow por conta própria.";
  }

  return (
    <main className="relative flex min-h-[80vh] items-center overflow-hidden py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-raio/10 blur-[120px]"
      />
      <div className="relative mx-auto max-w-[46rem] px-6 text-center sm:px-10">
        <div className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-2xl border border-hairline bg-surface/60 text-brand-violet"
        >
          {/* ícone de "voltar/renovar" (seta circular) */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 12a8 8 0 10-2.34 5.66M20 12V7m0 5h-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl font-bold leading-tight text-cloud sm:text-5xl"
        >
          {titulo}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slatey"
        >
          {descricao}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          {isEmpresa && (
            <>
              <a href="/empresas" className="btn-primary px-8 py-4 text-base">
                Renovar plano empresarial
              </a>
              <a href="/" className="btn-ghost px-8 py-4 text-base">
                Voltar ao site principal
              </a>
            </>
          )}

          {isColaborador && (
            <>
              <a href="/#planos" className="btn-primary px-8 py-4 text-base">
                Assinar plano individual
              </a>
              <a href="/" className="btn-ghost px-8 py-4 text-base">
                Voltar ao site principal
              </a>
            </>
          )}

          {isAvulso && (
            <>
              <a href="/#planos" className="btn-primary px-8 py-4 text-base">
                Renovar minha assinatura
              </a>
              <a href="/" className="btn-ghost px-8 py-4 text-base">
                Voltar ao site principal
              </a>
            </>
          )}

          {!conhecido && (
            // Acesso direto, sem perfil na URL: oferece os dois caminhos.
            <>
              <a href="/#planos" className="btn-primary px-8 py-4 text-base">
                Renovar plano individual
              </a>
              <a href="/empresas" className="btn-ghost px-8 py-4 text-base">
                Sou empresa
              </a>
            </>
          )}
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
