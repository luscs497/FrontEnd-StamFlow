"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useModals } from "@/components/Providers";
import { fadeUp, stagger } from "@/lib/motion";
import { TRIAL_DAYS } from "@/lib/config";

export function Hero() {
  const { openTrial } = useModals();
  const reduce = useReducedMotion();

  return (
    <section id="topo" className="relative overflow-hidden">
      {/* Degradê de fundo grande e presente (frio, da marca). Vive só na hero. */}
      <HeroGlow reduce={!!reduce} />

      <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-36 text-center sm:px-8 sm:pb-28 sm:pt-44">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.p variants={fadeUp} className="eyebrow justify-center">
            <span className="eyebrow-tick" /> Postura e humor, lidos em tempo real
          </motion.p>

          {/* Headline em escala "Happly": ousada, com keyword em gradiente */}
          <motion.h1
            variants={fadeUp}
            className="mx-auto mt-6 max-w-4xl text-balance font-display font-bold text-giant text-cloud"
          >
            Sua <span className="text-raio">energia</span> produtiva, lida pela câmera.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slatey sm:text-xl"
          >
            O StamFlow acompanha sua postura e seu humor pela câmera e transforma isso num índice
            de energia que cuida de você ao longo do dia.{" "}
            <span className="text-cloud">Nenhuma imagem sai do seu computador.</span>
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <button type="button" onClick={openTrial} className="btn-primary px-7 py-3.5 text-base">
              Começar teste grátis
            </button>
            <a href="#como-funciona" className="btn-ghost px-7 py-3.5 text-base">
              Ver como funciona
            </a>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-5 text-sm text-muted">
            {TRIAL_DAYS} dias completos · sem cartão · processado no seu navegador
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

/** Aura de gradiente da hero: camadas suaves e grandes, com respiração lenta. */
function HeroGlow({ reduce }: { reduce: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      {/* Aura principal, grande, atrás do título */}
      <motion.div
        className="absolute left-1/2 top-[-18%] h-[820px] w-[min(1200px,140vw)] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(46% 50% at 50% 42%, rgba(56,189,248,0.16), transparent 70%)," +
            "radial-gradient(42% 48% at 60% 30%, rgba(124,58,237,0.26), transparent 72%)," +
            "radial-gradient(36% 42% at 36% 34%, rgba(168,85,247,0.18), transparent 72%)",
          filter: "blur(28px)",
        }}
        initial={reduce ? { opacity: 0.9 } : { opacity: 0, scale: 0.96 }}
        animate={
          reduce
            ? { opacity: 0.9 }
            : { opacity: [0.75, 1, 0.75], scale: [1, 1.04, 1] }
        }
        transition={reduce ? undefined : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Faixa fina de marca, como linha de horizonte, fundindo na próxima seção */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(56,189,248,0.5), rgba(124,58,237,0.5), transparent)",
        }}
      />
    </div>
  );
}
