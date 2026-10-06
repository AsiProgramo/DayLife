"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  // reducedMotion="user": respeta prefers-reduced-motion en todas las animaciones
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
