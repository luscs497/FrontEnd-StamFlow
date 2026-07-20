"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/ui/Section";
import { Alert } from "@/components/ui/Alert";
import { useCart, useModals } from "@/components/Providers";
import {
  fetchAvulsoPlan,
  formatBRL,
  priceFor,
  PERIODS,
  type Plan,
  type Period,
} from "@/lib/plans";
import { fadeUp } from "@/lib/motion";

type LoadState = "loading" | "error" | "success";

export function Plans() {
  const { openEnterprise } = useModals();
  const { addToCart, item: cartItem } = useCart();
  const [state, setState] = useState<LoadState>("loading");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [period, setPeriod] = useState<Period>(PERIODS[3]); // anual por padrão
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState("loading");
    fetchAvulsoPlan()
      .then((data) => {
        if (!active) return;
        setPlan(data);
        setState("success");
      })
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <section id="planos" className="py-28 sm:py-36">
      <div className="mx-auto max-w-[76rem] px-6 sm:px-10">
        <Reveal className="flex flex-col items-center text-center">
          <SectionHeading
            align="center"
            eyebrow="Planos"
            title={
              <>
                Escolha o plano e o período de <span className="text-raio">aumento de performance</span>.
              </>
            }
            description="Acesso imediato a tudo que o StamFlow oferece. Cancele quando quiser — 7 dias de garantia, com reembolso, em qualquer plano."
          />
        </Reveal>

        {/* Seletor de período */}
        <Reveal delay={0.05} className="mt-9 flex justify-center">
          <div
            role="tablist"
            aria-label="Período de cobrança"
            className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-hairline bg-surface/60 p-1.5"
          >
            {PERIODS.map((p) => {
              const selected = p.id === period.id;
              const savings = priceFor(p).savingsPct;
              return (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setPeriod(p)}
                  className={`relative rounded-full px-4 py-2.5 text-base transition-colors ${
                    selected
                      ? "font-semibold text-white [text-shadow:0_1px_3px_rgba(11,17,32,0.45)]"
                      : "font-medium text-slatey hover:text-cloud"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="period-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-raio shadow-[0_8px_24px_-6px_rgba(124,58,237,0.6)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {p.label}
                  {savings > 0 && (
                    <span className={`ml-1.5 text-sm ${selected ? "text-white/85" : "text-signal"}`}>
                      −{savings}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Conteúdo conforme o estado de carregamento */}
        <div className="mt-12">
          {state === "loading" && <PlanSkeleton />}

          {state === "error" && (
            <div className="mx-auto max-w-md">
              <Alert tone="error">Não foi possível carregar o plano agora.</Alert>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="btn-ghost">
                  Tentar de novo
                </button>
              </div>
            </div>
          )}

          {state === "success" && plan && (
            <AvulsoCard
              plan={plan}
              period={period}
              inCart={cartItem?.periodId === period.id}
              onAdd={() => addToCart(period.id)}
            />
          )}
        </div>

        {/* Ponteiro discreto para o plano empresarial */}
        <Reveal delay={0.1} className="mt-8">
          <div className="mx-auto flex max-w-[76rem] flex-col items-center justify-between gap-4 rounded-3xl border border-hairline bg-surface-2/30 px-8 py-6 text-center sm:flex-row sm:text-left">
            <div>
              <h3 className="font-display text-xl font-bold text-cloud">É uma empresa?</h3>
              <p className="mt-1 text-[15px] text-slatey">
                Plano por licenças, com valor sob medida e visão agregada da equipe para o gestor.
              </p>
            </div>
            <button
              type="button"
              onClick={openEnterprise}
              className="btn-ghost shrink-0 whitespace-nowrap"
            >
              Falar com vendas
            </button>
          </div>
        </Reveal>

        <p className="mt-9 text-center text-[15px] text-muted">
          Preços de lançamento, em reais. Você pode trocar de período ou cancelar quando quiser.
        </p>
      </div>
    </section>
  );
}

function AvulsoCard({
  plan,
  period,
  inCart,
  onAdd,
}: {
  plan: Plan;
  period: Period;
  inCart: boolean;
  onAdd: () => void;
}) {
  const price = priceFor(period);

  return (
    <motion.div
      key={period.id}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="surface-card relative overflow-hidden p-8 sm:p-12"
    >
      {/* brilho decorativo sutil no canto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-raio/10 blur-3xl"
      />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
        {/* Coluna esquerda: identidade + preço + CTA */}
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5 text-[13px] font-semibold text-raio">
            Plano único · tudo incluído
          </span>

          <h3 className="mt-5 font-display text-3xl font-bold text-cloud sm:text-4xl">
            {plan.name}
          </h3>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-slatey">{plan.tagline}</p>

          <div className="mt-8">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-6xl font-bold text-cloud tabular-nums sm:text-7xl">
                {formatBRL(price.perMonth)}
              </span>
              <span className="text-lg text-muted">/mês</span>
            </div>
            <p className="mt-2.5 text-base text-muted">
              {period.months === 1
                ? "cobrança mensal recorrente"
                : `${formatBRL(price.total)} cobrados a cada ${period.months} meses`}
              {price.savingsPct > 0 && (
                <span className="ml-2 font-semibold text-signal">
                  você economiza {price.savingsPct}%
                </span>
              )}
            </p>
          </div>

          {inCart ? (
            <a href="/checkout/" className="btn-primary mt-9 w-full text-center sm:w-auto sm:px-10">
              No carrinho — concluir compra
            </a>
          ) : (
            <button type="button" onClick={onAdd} className="btn-primary mt-9 w-full sm:w-auto sm:px-10">
              Adicionar ao carrinho
            </button>
          )}
          <p className="mt-3 text-sm text-muted">Pagamento seguro pelo Mercado Pago · cancele quando quiser.</p>
        </div>

        {/* Coluna direita: features, em duas colunas para ocupar o espaço */}
        <div className="lg:border-l lg:border-hairline lg:pl-14">
          <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">
            Tudo o que está incluído
          </p>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[15px] leading-relaxed text-slatey">
                <span className="mt-0.5 shrink-0 text-signal">
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M2.5 7.3l2.6 2.6L11.5 4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function PlanSkeleton() {
  return (
    <div className="surface-card p-8 sm:p-12" aria-hidden="true">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
        <div>
          <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mt-5 h-9 w-64 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/5" />
          <div className="mt-8 h-16 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-9 h-12 w-full animate-pulse rounded-field bg-white/5 sm:w-64" />
        </div>
        <div className="lg:border-l lg:border-hairline lg:pl-14">
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
              <div key={j} className="h-4 w-full animate-pulse rounded bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
