"use client";

import { motion } from "framer-motion";
import { BrandMark } from "@/components/Brand";
import { useModals } from "@/components/Providers";
import { viewportOnce } from "@/lib/motion";
import { LOGIN_URL, TRIAL_DAYS } from "@/lib/config";

export function FinalCTA() {
  const { openTrial } = useModals();

  return (
    <section className="px-6 pb-28 sm:px-10 sm:pb-36">
      <div className="mx-auto max-w-[88rem]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="surface-card relative overflow-hidden px-8 py-20 text-center sm:px-14 sm:py-24"
        >
          {/* Glow de marca contido no topo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-raio-soft opacity-70 blur-2xl"
          />

          <div className="relative">
            <div className="mx-auto mb-7 w-fit">
              <BrandMark size={58} radius={18} />
            </div>
            <h2 className="mx-auto max-w-2xl font-display font-bold text-huge text-cloud">
              Comece a cuidar da sua <span className="text-raio">energia</span> hoje.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-xl text-slatey">
              {TRIAL_DAYS} dias com o produto completo, sem cartão. Leva menos de um minuto para começar.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <button type="button" onClick={openTrial} className="btn-primary px-8 py-4 text-base">
                Começar teste grátis
              </button>
              <a href={LOGIN_URL} className="btn-ghost px-8 py-4 text-base">
                Já tenho conta
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
