"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = { children: ReactNode; index?: number; className?: string };

/** Revelado al hacer scroll, en cascada segun el indice del elemento. */
export function Reveal({ children, index = 0, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(index, 8) * 0.04 }}
    >
      {children}
    </motion.div>
  );
}
