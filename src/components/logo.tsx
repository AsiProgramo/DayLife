import { IconSunrise } from "@tabler/icons-react";
import Link from "next/link";

import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 rounded-md", className)}
      aria-label="DayLife, ir al inicio"
    >
      <span className="grid size-9 place-items-center rounded-md bg-gradient-brand text-primary-foreground shadow-soft">
        <IconSunrise size={22} stroke={2} aria-hidden />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">DayLife</span>
    </Link>
  );
}
