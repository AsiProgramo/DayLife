"use client";

import {
  IconBarbell,
  IconBath,
  IconBook,
  IconBriefcase,
  IconCheck,
  IconChevronDown,
  IconCoffee,
  IconDroplet,
  IconFocus2,
  IconMail,
  IconMoodSmile,
  IconMoon,
  IconPencil,
  IconPlayerPause,
  IconSoup,
  IconSunrise,
  IconToolsKitchen2,
  type Icon,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import {
  ACTIVITIES,
  formatDuration,
  formatTime,
  getScheduleState,
  parseTime,
  type ActivityIcon,
} from "@/lib/schedule";

import { Dialog } from "./ui/dialog";
import { WakeTimeForm } from "./wake-time-form";

const ICONS: Record<ActivityIcon, Icon> = {
  wake: IconSunrise,
  water: IconDroplet,
  exercise: IconBarbell,
  shower: IconBath,
  breakfast: IconCoffee,
  focus: IconFocus2,
  break: IconPlayerPause,
  tasks: IconMail,
  lunch: IconToolsKitchen2,
  work: IconBriefcase,
  free: IconMoodSmile,
  dinner: IconSoup,
  read: IconBook,
  sleep: IconMoon,
};

function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

/** Minutos del dia segun el reloj del dispositivo; null hasta montar en el cliente. */
function useNowMinutes(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const date = new Date();
      setNow(date.getHours() * 60 + date.getMinutes());
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

type Props = { name: string; wakeTime: string | null };

export function TodayPanel({ name, wakeTime }: Props) {
  const now = useNowMinutes();
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const firstName = name.split(" ")[0];
  const title = `${now === null ? "Hola" : greeting(Math.floor(now / 60))}, ${firstName}`;

  // Primer uso: lo unico que se pide es la hora de despertar.
  if (!wakeTime) {
    return (
      <section aria-labelledby="today-title" className="space-y-5">
        <h1 id="today-title" className="font-display text-3xl font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        <div className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="mb-5 space-y-1.5">
            <h2 className="font-display text-xl font-semibold leading-tight">Arma tu día en un paso</h2>
            <p className="leading-relaxed text-muted-foreground">
              Con tu hora de despertar calculamos el horario completo, hasta la hora de dormir.
            </p>
          </div>
          <WakeTimeForm current={null} submitLabel="Crear mi horario" />
        </div>
      </section>
    );
  }

  const wake = parseTime(wakeTime);
  const state = now === null ? null : getScheduleState(wake, now);
  const current = state ? ACTIVITIES[state.currentIndex] : null;
  const next = state ? ACTIVITIES[state.currentIndex + 1] : null;
  const CurrentIcon = current ? ICONS[current.icon] : null;
  const progress = state ? Math.round((state.elapsed / state.duration) * 100) : 0;

  return (
    <section aria-labelledby="today-title" className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <h1 id="today-title" className="font-display text-3xl font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="-mr-2 inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <IconSunrise size={18} aria-hidden />
          <span className="tabular-nums">{formatTime(wake)}</span>
          <IconPencil size={16} aria-hidden />
          <span className="sr-only">Cambiar hora de despertar</span>
        </button>
      </div>

      {/* Que toca ahora: el dato principal de la pantalla */}
      <div className="rounded-lg border border-border bg-card bg-gradient-brand-soft p-5 shadow-soft sm:p-6">
        {state && current && CurrentIcon ? (
          <div aria-live="polite">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Ahora
            </p>
            <div className="mt-3 flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-md bg-gradient-brand text-primary-foreground shadow-glow">
                <CurrentIcon size={28} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                  {current.name}
                </p>
                <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                  {formatTime(wake + current.min)} – {formatTime(wake + current.min + state.duration)}
                </p>
              </div>
            </div>
            <div
              role="progressbar"
              aria-label={`Progreso de ${current.name}`}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-5 h-2 overflow-hidden rounded-full bg-foreground/10"
            >
              <div
                className="h-full rounded-full bg-gradient-brand transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {next ? (
                <>
                  En <span className="font-medium tabular-nums text-foreground">{formatDuration(state.duration - state.elapsed)}</span>
                  {" "}sigue <span className="font-medium text-foreground">{next.name}</span>
                </>
              ) : (
                <>
                  Te despiertas en{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {formatDuration(state.duration - state.elapsed)}
                  </span>
                </>
              )}
            </p>
          </div>
        ) : (
          <div aria-hidden className="space-y-4">
            <div className="skeleton h-4 w-16" />
            <div className="flex items-center gap-4">
              <div className="skeleton size-14" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-7 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            </div>
            <div className="skeleton h-2 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        )}
      </div>

      {/* Horario completo: siempre visible en escritorio, plegable en movil */}
      <div className="rounded-lg border border-border bg-card shadow-soft">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="schedule-list"
          className="flex h-14 w-full items-center justify-between rounded-lg px-5 font-medium lg:hidden"
        >
          Ver el horario completo
          <IconChevronDown
            size={20}
            aria-hidden
            className={cn("transition-transform duration-200", expanded && "rotate-180")}
          />
        </button>
        <h2 className="hidden px-5 pt-5 text-sm font-medium text-muted-foreground lg:block">
          Tu horario de hoy
        </h2>
        <ol id="schedule-list" className={cn("space-y-0.5 p-2 lg:block", expanded ? "block" : "hidden")}>
          {ACTIVITIES.map((activity, index) => {
            const ActivityIcon = ICONS[activity.icon];
            const isCurrent = state?.currentIndex === index;
            const isPast = state ? index < state.currentIndex : false;
            return (
              <li
                key={activity.name}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                  isCurrent && "bg-primary/10 font-medium",
                  isPast && "text-muted-foreground",
                )}
              >
                <span className="w-[4.75rem] shrink-0 text-sm tabular-nums text-muted-foreground">
                  {formatTime(wake + activity.min)}
                </span>
                <ActivityIcon
                  size={18}
                  aria-hidden
                  className={cn("shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")}
                />
                <span className={cn("min-w-0 flex-1 truncate", isPast && "line-through decoration-muted-foreground/40")}>
                  {activity.name}
                </span>
                {isPast ? <IconCheck size={16} aria-label="Hecho" className="shrink-0" /> : null}
                {isCurrent ? (
                  <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    Ahora
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        title="Hora de despertar"
        description="Tu horario completo se recalcula a partir de esta hora."
      >
        <WakeTimeForm current={wakeTime} submitLabel="Guardar hora" onSaved={() => setEditing(false)} />
      </Dialog>
    </section>
  );
}
