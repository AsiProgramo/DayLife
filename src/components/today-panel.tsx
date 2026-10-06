"use client";

import {
  IconAdjustmentsHorizontal,
  IconCheck,
  IconChevronDown,
  IconPencil,
  IconPinFilled,
  IconSunrise,
} from "@tabler/icons-react";
import { useEffect, useState, useTransition } from "react";
import { sileo } from "sileo";

import { setActivityDone } from "@/actions/settings";
import { cn } from "@/lib/cn";
import {
  defaultBedTime,
  formatDuration,
  formatTime,
  getScheduleState,
  parseTime,
  planDay,
  type Block,
  type DayLog,
} from "@/lib/schedule";

import { ACTIVITY_ICONS } from "./activity-icons";
import { RoutineEditor } from "./routine-editor";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { WakeTimeForm } from "./wake-time-form";

function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

const pad = (value: number): string => String(value).padStart(2, "0");

type Clock = { minutes: number; timestamp: number };

/** Reloj del dispositivo; null hasta montar en el cliente (evita desajustes de hidratacion). */
function useClock(): Clock | null {
  const [clock, setClock] = useState<Clock | null>(null);
  useEffect(() => {
    const tick = () => {
      const date = new Date();
      setClock({ minutes: date.getHours() * 60 + date.getMinutes(), timestamp: date.getTime() });
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return clock;
}

/**
 * Clave del dia en curso. El dia empieza al despertar, no a medianoche: quien
 * se acuesta tarde no pierde lo que ya marco como hecho.
 */
function dayKey(clock: Clock, wakeMinutes: number): string {
  const date = new Date(clock.timestamp - wakeMinutes * 60_000);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

type Props = {
  name: string;
  wakeTime: string | null;
  bedTime: string | null;
  blocks: Block[];
  dayLog: DayLog;
};

export function TodayPanel({ name, wakeTime, bedTime, blocks, dayLog }: Props) {
  const clock = useClock();
  const [dialog, setDialog] = useState<"wake" | "routine" | null>(null);
  const [expanded, setExpanded] = useState(false);
  // cambios locales aun no confirmados por el servidor (UI optimista)
  const [local, setLocal] = useState<DayLog | null>(null);
  const [, startTransition] = useTransition();

  const firstName = name.split(" ")[0];
  const title = `${clock === null ? "Hola" : greeting(Math.floor(clock.minutes / 60))}, ${firstName}`;

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
              Con tu hora de despertar armamos un horario que luego puedes ajustar a tu gusto.
            </p>
          </div>
          <WakeTimeForm current={null} submitLabel="Crear mi horario" />
        </div>
      </section>
    );
  }

  const wake = parseTime(wakeTime);
  const bed = bedTime ? parseTime(bedTime) : defaultBedTime(blocks, wake);
  const plan = planDay(blocks, wake, bed);
  const items = plan.items;
  const state = clock ? getScheduleState(items, wake, clock.minutes) : null;
  const today = clock ? dayKey(clock, wake) : null;
  const current = state ? items[state.currentIndex] : null;
  const next = state ? items[state.currentIndex + 1] : null;
  const CurrentIcon = current ? ACTIVITY_ICONS[current.icon].icon : null;
  const remaining = state && current ? current.duration - state.elapsed : 0;
  const progress = state && current ? Math.round((state.elapsed / current.duration) * 100) : 0;

  const saved = today && dayLog.date === today ? dayLog.done : [];
  const done = new Set(today && local?.date === today ? local.done : saved);
  const tasks = items.filter((item) => item.kind === "task");
  const doneCount = tasks.filter((item) => done.has(item.id)).length;
  const allDone = tasks.length > 0 && doneCount === tasks.length;

  const toggle = (id: string) => {
    if (!today) return;
    const willBeDone = !done.has(id);
    const nextDone = new Set(done);
    if (willBeDone) nextDone.add(id);
    else nextDone.delete(id);
    setLocal({ date: today, done: [...nextDone] });

    startTransition(async () => {
      const result = await setActivityDone(id, today, willBeDone).catch(() => ({
        error: "Revisa tu conexión e inténtalo de nuevo.",
      }));
      if (result.error) {
        setLocal(null);
        sileo.error({ title: "No se guardó el cambio", description: result.error });
      } else if (willBeDone && nextDone.size >= tasks.length && tasks.every((t) => nextDone.has(t.id))) {
        sileo.success({ title: "Día completo", description: "Hiciste todo lo que te propusiste hoy." });
      }
    });
  };

  return (
    <section aria-labelledby="today-title" className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <h1 id="today-title" className="font-display text-3xl font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        <button
          type="button"
          onClick={() => setDialog("wake")}
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
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Ahora
            </p>
            <div className="mt-3 flex items-center gap-4" aria-live="polite">
              <span className="grid size-14 shrink-0 place-items-center rounded-md bg-gradient-brand text-primary-foreground shadow-glow">
                <CurrentIcon size={28} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                  {current.name}
                </p>
                <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                  {formatTime(wake + current.start)} – {formatTime(wake + current.start + current.duration)}
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
                  En <span className="font-medium tabular-nums text-foreground">{formatDuration(remaining)}</span>{" "}
                  sigue <span className="font-medium text-foreground">{next.name}</span>
                </>
              ) : (
                <>
                  Te despiertas en{" "}
                  <span className="font-medium tabular-nums text-foreground">{formatDuration(remaining)}</span>
                </>
              )}
            </p>
            {current.kind === "task" ? (
              <Button
                variant={done.has(current.id) ? "secondary" : "primary"}
                className="mt-4 w-full"
                aria-pressed={done.has(current.id)}
                onClick={() => toggle(current.id)}
              >
                <IconCheck size={18} aria-hidden />
                {done.has(current.id) ? "Hecha" : "Marcar como hecha"}
              </Button>
            ) : null}
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
            <div className="skeleton h-11 w-full" />
          </div>
        )}
      </div>

      {/* Horario completo: siempre visible en escritorio, plegable en movil */}
      <div className="rounded-lg border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between gap-3 px-5 pt-4">
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-muted-foreground">Tu día</h2>
            <p className="font-display text-xl font-semibold leading-tight tabular-nums">
              {doneCount} <span className="text-base font-normal text-muted-foreground">de {tasks.length} hechas</span>
            </p>
          </div>
          <Button variant="secondary" onClick={() => setDialog("routine")}>
            <IconAdjustmentsHorizontal size={18} aria-hidden />
            Personalizar
          </Button>
        </div>
        <div
          role="progressbar"
          aria-label="Actividades hechas hoy"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={tasks.length}
          className="mx-5 mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500 ease-out",
              allDone ? "bg-success" : "bg-primary",
            )}
            style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="schedule-list"
          className="mt-2 flex h-12 w-full items-center justify-between rounded-lg px-5 text-sm font-medium lg:hidden"
        >
          {expanded ? "Ocultar el horario" : "Ver el horario completo"}
          <IconChevronDown
            size={20}
            aria-hidden
            className={cn("transition-transform duration-200", expanded && "rotate-180")}
          />
        </button>

        <ol id="schedule-list" className={cn("space-y-0.5 p-2 lg:mt-2 lg:block", expanded ? "block" : "hidden")}>
          {items.map((item, index) => {
            const ItemIcon = ACTIVITY_ICONS[item.icon].icon;
            const isCurrent = state?.currentIndex === index;
            const isDone = done.has(item.id);
            return (
              <li
                key={item.id}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1 rounded-md pr-3 transition-colors",
                  isCurrent && "bg-primary/10",
                )}
              >
                {item.kind !== "task" ? (
                  <span className="grid size-11 shrink-0 place-items-center text-muted-foreground">
                    <ItemIcon size={18} aria-hidden />
                  </span>
                ) : (
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={`${item.name}, hecha`}
                    disabled={!today}
                    onClick={() => toggle(item.id)}
                    className="group grid size-11 shrink-0 place-items-center rounded-md"
                  >
                    <span
                      className={cn(
                        "grid size-6 place-items-center rounded-full border-2 transition duration-200 group-active:scale-90",
                        isDone
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input text-transparent group-hover:border-primary",
                      )}
                    >
                      <IconCheck size={14} stroke={3} aria-hidden />
                    </span>
                  </button>
                )}
                <span className="w-[4.5rem] shrink-0 text-sm tabular-nums text-muted-foreground">
                  {formatTime(wake + item.start)}
                </span>
                {item.kind === "task" ? (
                  <ItemIcon
                    size={18}
                    aria-hidden
                    className={cn("mr-1 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")}
                  />
                ) : null}
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate py-2.5",
                    isCurrent && "font-medium",
                    item.kind === "free" && "italic text-muted-foreground",
                    isDone && "text-muted-foreground line-through decoration-muted-foreground/50",
                  )}
                >
                  {item.name}
                  {item.fixedAt ? (
                    <IconPinFilled
                      size={12}
                      aria-label="Hora fija"
                      className="ml-1.5 inline-block align-baseline text-muted-foreground"
                    />
                  ) : null}
                </span>
                {isCurrent ? (
                  <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    Ahora
                  </span>
                ) : (
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatDuration(item.duration)}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <Dialog
        open={dialog === "wake"}
        onClose={() => setDialog(null)}
        title="Hora de despertar"
        description="Todo tu horario se mueve con esta hora."
      >
        <WakeTimeForm current={wakeTime} submitLabel="Guardar hora" onSaved={() => setDialog(null)} />
      </Dialog>

      <Dialog
        open={dialog === "routine"}
        onClose={() => setDialog(null)}
        title="Personaliza tu día"
        description="Pon tus cosas fijas con su hora y reparte el tiempo libre que queda."
        className="max-w-xl"
      >
        <RoutineEditor
          blocks={blocks}
          wakeMinutes={wake}
          bedMinutes={bed}
          onSaved={() => setDialog(null)}
        />
      </Dialog>
    </section>
  );
}
