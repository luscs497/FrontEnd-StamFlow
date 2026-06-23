"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

/** Revela o conteúdo com um fade-up quando entra na viewport (uma vez). */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/** Container com stagger para listas de filhos animados. */
export function RevealGroup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}

export const item = fadeUp;

/** Cabeçalho de seção: eyebrow + título + descrição opcional. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className={`eyebrow ${align === "center" ? "justify-center" : ""}`}>
        <span className="eyebrow-tick" /> {eyebrow}
      </p>
      <h2 className="mt-5 font-display font-bold text-huge text-cloud">{title}</h2>
      {description && <p className="mt-5 text-xl leading-relaxed text-slatey">{description}</p>}
    </div>
  );
}
