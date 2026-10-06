import { IconCheck } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { Logo } from "@/components/logo";
import { defaultBedTime, DEFAULT_BLOCKS, formatTime, parseTime, planDay } from "@/lib/schedule";

const SAMPLE_WAKE = parseTime("06:30");
const SCHEDULE = planDay(DEFAULT_BLOCKS, SAMPLE_WAKE, defaultBedTime(DEFAULT_BLOCKS, SAMPLE_WAKE)).items;
const SAMPLE = [0, 2, 4, 5].map((index) => SCHEDULE[index]);

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Panel de marca: propuesta de valor + vista previa del producto */}
      <aside className="bg-aurora hidden flex-col justify-between border-r border-border bg-card p-12 lg:flex">
        <Logo />

        <div className="max-w-lg space-y-6">
          <h2 className="animate-fade-up font-display text-5xl font-semibold leading-[1.08] tracking-tight">
            Tu día empieza <span className="text-gradient">cuando tú despiertas</span>
          </h2>
          <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">
            Dinos a qué hora te levantas y DayLife arma tu horario completo: ejercicio,
            trabajo profundo, descansos y hora de dormir.
          </p>

          <ol className="space-y-2 rounded-lg border border-border bg-background/70 p-3 shadow-soft backdrop-blur">
            {SAMPLE.map((activity, index) => (
              <li
                key={activity.id}
                className={
                  index === 1
                    ? "flex items-center gap-3 rounded-md bg-primary/10 px-3 py-2.5 font-medium"
                    : "flex items-center gap-3 px-3 py-2.5 text-muted-foreground"
                }
              >
                <span className="w-20 shrink-0 text-sm tabular-nums">
                  {formatTime(SAMPLE_WAKE + activity.start)}
                </span>
                <span className="flex-1">{activity.name}</span>
                {index === 0 ? <IconCheck size={18} aria-hidden /> : null}
                {index === 1 ? (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    Ahora
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <p className="text-sm text-muted-foreground">
          Comparte tus momentos del día con la comunidad.
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Logo className="mb-10 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
