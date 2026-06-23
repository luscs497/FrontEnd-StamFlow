"use client";

import { Reveal } from "@/components/ui/Section";

const STATS = [
  { v: "100%", k: "processado no navegador" },
  { v: "0", k: "vídeos enviados a servidor" },
  { v: "7 dias", k: "de teste, produto completo" },
  { v: "30s", k: "para cada leitura de energia" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-hairline py-12">
      <div className="mx-auto max-w-[88rem] px-6 sm:px-10">
        <Reveal className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.k} className="text-center sm:text-left">
              <p className="font-display text-3xl font-bold text-cloud sm:text-4xl">{s.v}</p>
              <p className="mt-1.5 text-base text-slatey">{s.k}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
