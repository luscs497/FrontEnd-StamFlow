"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/ui/Section";
import { Alert } from "@/components/ui/Alert";
import { useModals } from "@/components/Providers";
import {
  fetchIndividualPlans,
  formatBRL,
  priceFor,
  PERIODS,
  type Plan,
  type Period,
} from "@/lib/plans";
import { fadeUp, viewportOnce } from "@/lib/motion";

type LoadState = "loading" | "error" | "success";

export function Plans() {
  const { openTrial, openEnterprise } = useModals();
  const [state, setState] = useState<LoadState>("loading");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [period, setPeriod] = useState<Period>(PERIODS[3]); // anual por padrão
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState("loading");
    fetchIndividualPlans()
      .then((data) => {
        if (!active) return;
        setPlans(data);
        setState("success");
      })
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <section id="planos" className="py-28 sm:py-36">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10">
        <Reveal className="flex flex-col items-center text-center">
          <SectionHeading
            align="center"
            eyebrow="Planos"
            title={
              <>
                Comece grátis. <span className="text-raio">Continue no seu ritmo.</span>
              </>
            }
            description="Sete dias com tudo liberado. Depois, escolha o plano que combina com o seu dia."
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
                  {p.discount > 0 && (
                    <span className={`ml-1.5 text-sm ${selected ? "text-white/85" : "text-signal"}`}>
                      −{Math.round(p.discount * 100)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Conteúdo conforme o estado de carregamento */}
        <div className="mt-12">
          {state === "loading" && <PlansSkeleton />}

          {state === "error" && (
            <div className="mx-auto max-w-md">
              <Alert tone="error">Não foi possível carregar os planos agora.</Alert>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="btn-ghost">
                  Tentar de novo
                </button>
              </div>
            </div>
          )}

          {state === "success" && (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              className="grid gap-6 md:grid-cols-3"
            >
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} period={period} onChoose={openTrial} />
              ))}
              <EnterprisePointer onChoose={openEnterprise} />
            </motion.div>
          )}
        </div>

        <p className="mt-9 text-center text-[15px] text-muted">
          Preços de lançamento, em reais. Você pode trocar de plano ou cancelar quando quiser.
        </p>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  period,
  onChoose,
}: {
  plan: Plan;
  period: Period;
  onChoose: () => void;
}) {
  const price = priceFor(plan, period);

  return (
    <motion.div
      variants={fadeUp}
      className={`surface-card relative flex flex-col p-8 ${
        plan.highlight ? "ring-1 ring-brand-violet/50" : ""
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3.5 left-8 rounded-full bg-raio px-3.5 py-1.5 text-[13px] font-bold text-ink">
          Mais escolhido
        </span>
      )}

      <h3 className="font-display text-2xl font-bold text-cloud">{plan.name}</h3>
      <p className="mt-2.5 min-h-[48px] text-base leading-relaxed text-slatey">{plan.tagline}</p>

      <div className="mt-6">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[44px] font-bold text-cloud tabular-nums">
            {formatBRL(price.perMonth)}
          </span>
          <span className="text-base text-muted">/mês</span>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          {period.months === 1
            ? "cobrança mensal"
            : `${formatBRL(price.total)} a cada ${period.months} meses`}
          {price.savingsPct > 0 && (
            <span className="ml-1.5 font-semibold text-signal">economia de {price.savingsPct}%</span>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onChoose}
        className={`mt-7 w-full ${plan.highlight ? "btn-primary" : "btn-ghost"}`}
      >
        Começar teste grátis
      </button>

      <ul className="mt-7 space-y-3 border-t border-hairline pt-7">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[15px] text-slatey">
            <span className="mt-0.5 text-signal">
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7.3l2.6 2.6L11.5 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function EnterprisePointer({ onChoose }: { onChoose: () => void }) {
  return (
    <motion.div
      variants={fadeUp}
      className="surface-card flex flex-col justify-between bg-surface-2/30 p-8"
    >
      <div>
        <h3 className="font-display text-2xl font-bold text-cloud">Empresas</h3>
        <p className="mt-2.5 text-base leading-relaxed text-slatey">
          Plano por licenças, com valor sob medida. Visão agregada da equipe para o gestor.
        </p>
        <div className="mt-6">
          <span className="font-display text-[34px] font-bold text-raio">Sob medida</span>
          <p className="mt-1.5 text-sm text-muted">por colaborador e licença de gestor</p>
        </div>
      </div>
      <button type="button" onClick={onChoose} className="btn-ghost mt-7 w-full">
        Falar com vendas
      </button>
    </motion.div>
  );
}

function PlansSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="surface-card p-8">
          <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-white/5" />
          <div className="mt-6 h-10 w-32 animate-pulse rounded bg-white/10" />
          <div className="mt-6 h-11 w-full animate-pulse rounded-field bg-white/5" />
          <div className="mt-6 space-y-2.5 border-t border-hairline pt-6">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-3.5 w-full animate-pulse rounded bg-white/5" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
