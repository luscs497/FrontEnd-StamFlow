"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { LOGIN_URL } from "@/lib/config";

/**
 * Página de retorno do Mercado Pago após o pagamento.
 *
 * O MP redireciona para esta URL com os parâmetros:
 *   ?collection_status=approved|pending|rejected
 *   &payment_id=...
 *   &external_reference=...
 *
 * Exibe mensagem contextual + mini tutorial de acesso ao painel.
 */
export function PagamentoConcluido() {
  const params = useSearchParams();
  const status = params.get("collection_status") ?? params.get("status") ?? "pending";

  const isApproved = status === "approved";
  const isPending  = status === "pending" || status === "in_process";
  const isRejected = !isApproved && !isPending;

  return (
    <main className="relative overflow-hidden pb-28 pt-32 sm:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-raio/10 blur-[120px]"
      />
      <div className="relative mx-auto max-w-[56rem] px-6 sm:px-10">

        {/* ─── Cabeçalho contextual ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-2xl border border-hairline bg-surface/60">
            {isApproved && (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-signal">
                <path d="M4 12.5l4.5 4.5L20 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {isPending && (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-yellow-400">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            )}
            {isRejected && (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-brand-violet">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            )}
          </div>

          <h1 className={`font-display text-4xl font-bold sm:text-5xl ${
            isApproved ? "text-signal" : isPending ? "text-yellow-400" : "text-raio"
          }`}>
            {isApproved && "Pagamento confirmado!"}
            {isPending  && "Pagamento em análise"}
            {isRejected && "Pagamento não concluído"}
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-slatey">
            {isApproved && "Seu acesso ao StamFlow está liberado. Você também receberá um e-mail de confirmação com as instruções de acesso."}
            {isPending  && "Seu pagamento está sendo processado. Assim que for confirmado, você receberá um e-mail com as instruções de acesso ao painel."}
            {isRejected && "Não foi possível processar o pagamento. Você pode tentar novamente com outro cartão ou método de pagamento."}
          </p>
        </motion.div>

        {/* ─── Mini tutorial (aprovado e pendente) ─── */}
        {(isApproved || isPending) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card mt-10 p-7 sm:p-10"
          >
            <p className="mb-6 text-[13px] font-semibold uppercase tracking-wide text-muted">
              Como acessar o painel
            </p>

            <ol className="space-y-5">
              {[
                {
                  n: "1",
                  title: "Abra o link de acesso",
                  body: (
                    <>
                      Clique em{" "}
                      <a href={LOGIN_URL} className="font-medium text-raio hover:underline">
                        {LOGIN_URL.replace("https://", "")}
                      </a>{" "}
                      ou use o {isApproved ? "botão" : "link"} abaixo.
                    </>
                  ),
                },
                {
                  n: "2",
                  title: "Digite seu e-mail",
                  body: "Use o mesmo e-mail que você informou no cadastro.",
                },
                {
                  n: "3",
                  title: "Digite sua senha",
                  body: "A senha que você criou durante o cadastro. Clique em Entrar e você estará no painel.",
                },
              ].map((s) => (
                <li key={s.n} className="flex items-start gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-raio/15 font-display text-[15px] font-bold text-raio">
                    {s.n}
                  </span>
                  <div className="pt-0.5">
                    <p className="font-semibold text-cloud">{s.title}</p>
                    <p className="mt-0.5 text-[15px] leading-relaxed text-slatey">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {isApproved && (
              <a href={LOGIN_URL} className="btn-primary mt-8 inline-block px-8 py-4 text-base">
                Acessar meu painel agora
              </a>
            )}
            {isPending && (
              <p className="mt-6 text-[14px] text-muted">
                Salve este link:{" "}
                <a href={LOGIN_URL} className="text-slatey underline underline-offset-4 hover:text-cloud">
                  {LOGIN_URL}
                </a>
                . Assim que o pagamento for confirmado, você consegue entrar.
              </p>
            )}
          </motion.div>
        )}

        {/* ─── CTA de pagamento rejeitado ─── */}
        {isRejected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <a href="/checkout/" className="btn-primary px-8 py-4 text-base">
              Tentar novamente
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
