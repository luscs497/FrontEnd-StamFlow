"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Raio } from "@/components/Brand";
import { fadeUp, stagger } from "@/lib/motion";

/**
 * Hero "ondas de energia": canvas com linhas luminosas contínuas que reagem
 * ao mouse (adaptação do padrão glowy-waves para o sistema StamFlow — sem
 * shadcn/lucide; tokens e ícones da casa). As ondas usam as cores do produto:
 * o espectro de energia (verde/âmbar) somado à marca (ciano/violeta).
 * Conteúdo centralizado, sem botões, conforme o doc de copy da LP B2C.
 */

interface Wave {
  offset: number;
  amplitude: number;
  frequency: number;
  /** "r,g,b" — a alpha entra por onda. */
  rgb: string;
  alpha: number;
}

const WAVES: Wave[] = [
  { offset: 0, amplitude: 46, frequency: 0.003, rgb: "56,189,248", alpha: 0.5 }, // ciano (marca)
  { offset: Math.PI / 2, amplitude: 64, frequency: 0.0024, rgb: "124,58,237", alpha: 0.42 }, // violeta (marca)
  { offset: Math.PI, amplitude: 40, frequency: 0.0036, rgb: "52,211,153", alpha: 0.4 }, // verde (energia alta)
  { offset: Math.PI * 1.5, amplitude: 54, frequency: 0.0021, rgb: "251,191,36", alpha: 0.2 }, // âmbar (atenção)
  { offset: Math.PI * 2, amplitude: 32, frequency: 0.0042, rgb: "148,163,184", alpha: 0.14 }, // slate neutro
];

const PILLS = [
  "Processado 100% no seu navegador",
  "Leitura pela câmera, ao vivo",
  "Cancele quando quiser",
] as const;

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouseInfluence = reduce ? 8 : 64;
    const influenceRadius = reduce ? 150 : 320;
    const smoothing = reduce ? 0.04 : 0.1;

    let raf = 0;
    let time = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = section.offsetWidth;
      height = section.offsetHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mouse.x = target.x = width / 2;
      mouse.y = target.y = height / 2;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      target.x = width / 2;
      target.y = height / 2;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    const drawWave = (wave: Wave, baseY: number) => {
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= width; x += 4) {
        const dx = x - mouse.x;
        const dy = baseY - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / influenceRadius);
        const mouseEffect =
          influence * mouseInfluence * Math.sin(time * 0.001 + x * 0.01 + wave.offset);

        const y =
          baseY +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.45) +
          mouseEffect;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const color = `rgba(${wave.rgb},${wave.alpha})`;
      ctx.lineWidth = 2.25;
      ctx.strokeStyle = color;
      ctx.shadowBlur = 32;
      ctx.shadowColor = color;
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      time += 1;
      mouse.x += (target.x - mouse.x) * smoothing;
      mouse.y += (target.y - mouse.y) * smoothing;

      ctx.clearRect(0, 0, width, height);
      // As ondas correm no quarto inferior, na zona das pills (que têm fundo
      // próprio) — longe da headline e da sub-headline.
      const baseY = height * 0.78;
      WAVES.forEach((w) => drawWave(w, baseY));

      raf = window.requestAnimationFrame(animate);
    };
    raf = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="topo"
      ref={sectionRef}
      className="relative flex min-h-[76vh] items-center overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {/* Véu sutil atrás do bloco de texto, para leitura sobre as ondas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
        style={{
          background:
            "radial-gradient(52% 60% at 50% 38%, rgba(11,17,32,0.72), transparent 75%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-24 pt-32 text-center sm:px-8 sm:pt-36">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.p
            variants={fadeUp}
            className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-slatey backdrop-blur-sm"
          >
            <Raio size={14} /> Eleve seu foco e produtividade
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mx-auto mt-7 max-w-3xl text-balance font-display font-bold text-huge text-cloud"
          >
            Cansado de passar o dia com{" "}
            <span className="text-raio">dor nas costas</span> e frustrado com seu
            rendimento?
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slatey sm:text-lg"
          >
            Tenha um parceiro leal de produtividade, que te acompanha durante toda sua jornada,
            prevenindo a exaustão antes que ela aconteça e{" "}
            <span className="text-cloud">protegendo seu foco nas tarefas</span>.
          </motion.p>

          <motion.ul
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            {PILLS.map((pill) => (
              <li
                key={pill}
                className="rounded-full border border-hairline bg-surface/60 px-4 py-2 text-[13px] font-medium text-slatey backdrop-blur-sm"
              >
                {pill}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
