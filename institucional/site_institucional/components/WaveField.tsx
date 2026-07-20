"use client";

import { useEffect, useRef } from "react";

/**
 * Ondas de energia em canvas — a assinatura visual do StamFlow (mesmo efeito
 * da hero da home, extraído para reuso nas landings). Linhas luminosas nas
 * cores do produto (marca + espectro de energia), com influência suave do
 * mouse e respeito a prefers-reduced-motion.
 *
 * O canvas preenche o elemento PAI posicionado (position: relative) — use
 * dentro de uma section com `relative overflow-hidden`.
 */

interface Wave {
  offset: number;
  amplitude: number;
  frequency: number;
  /** "r,g,b" — a alpha entra por onda, escalada por `intensity`. */
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

export function WaveField({
  baseYFactor = 0.78,
  intensity = 1,
}: {
  /** Posição vertical da linha-base das ondas (fração da altura da seção). */
  baseYFactor?: number;
  /** Multiplicador da opacidade das ondas (0–1 para versões mais discretas). */
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.parentElement;
    if (!canvas || !section) return undefined;
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

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      const color = `rgba(${wave.rgb},${wave.alpha * intensity})`;
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
      const baseY = height * baseYFactor;
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
  }, [baseYFactor, intensity]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
