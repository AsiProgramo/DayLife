"use client";

import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconMoon,
  IconPin,
  IconPinFilled,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { sileo } from "sileo";

import { saveRoutine } from "@/actions/settings";
import { cn } from "@/lib/cn";
import {
  DURATION_OPTIONS,
  formatDuration,
  formatTime,
  ICON_KEYS,
  MAX_BLOCKS,
  parseTime,
  planDay,
  RECOMMENDED_SLEEP_MINUTES,
  TEMPLATES,
  toTimeValue,
  type Block,
} from "@/lib/schedule";

import { ACTIVITY_ICONS } from "./activity-icons";
import { Button } from "./ui/button";
import { controlClass } from "./ui/field";

const newId = (): string => crypto.randomUUID().replace(/-/g, "").slice(0, 12);

const iconButtonClass =
  "grid size-11 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

type Props = { blocks: Block[]; wakeMinutes: number; bedMinutes: number; onSaved: () => void };

export function RoutineEditor({ blocks: initial, wakeMinutes, bedMinutes, onSaved }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [bedTime, setBedTime] = useState(toTimeValue(bedMinutes));
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const bed = bedTime ? parseTime(bedTime) : bedMinutes;
  const plan = planDay(blocks, wakeMinutes, bed);
  const startOf = new Map(plan.items.map((item) => [item.id, item.start]));
  const sleep = 1440 - plan.awake;
  const overBudget = plan.flexibleTotal - plan.freeTotal;

  // fijas en orden de hora; flexibles en el orden en que se reparten
  const sinceWake = (block: Block) => (((parseTime(block.fixedAt!) - wakeMinutes) % 1440) + 1440) % 1440;
  const fixed = blocks.filter((block) => block.fixedAt).sort((a, b) => sinceWake(a) - sinceWake(b));
  const flexible = blocks.filter((block) => !block.fixedAt);

  const hasEmptyName = blocks.some((block) => block.name.trim() === "");
  const blocked = plan.problems.length > 0 || hasEmptyName || !bedTime;

  const update = (id: string, patch: Partial<Block>) =>
    setBlocks((list) => list.map((block) => (block.id === id ? { ...block, ...patch } : block)));

  const remove = (id: string) => setBlocks((list) => list.filter((block) => block.id !== id));

  /** Convierte una flexible en fija (a la hora que le toca ahora) o al reves. */
  const togglePin = (block: Block) => {
    if (block.fixedAt) {
      setBlocks((list) =>
        list.map((item) => (item.id === block.id ? { ...item, fixedAt: undefined } : item)),
      );
    } else {
      update(block.id, { fixedAt: toTimeValue(wakeMinutes + (startOf.get(block.id) ?? 0)) });
    }
  };

  const moveFlexible = (index: number, direction: -1 | 1) =>
    setBlocks((list) => {
      const order = list.filter((block) => !block.fixedAt);
      const target = index + direction;
      [order[index], order[target]] = [order[target], order[index]];
      return [...list.filter((block) => block.fixedAt), ...order];
    });

  const onSave = () => {
    startTransition(async () => {
      const result = await saveRoutine(
        blocks.map((block) => ({ ...block, name: block.name.trim() })),
        bedTime,
      );
      if (result.error) {
        sileo.error({ title: "No se guardó la rutina", description: result.error });
        return;
      }
      sileo.success({ title: "Rutina guardada", description: "Tu horario ya está actualizado." });
      onSaved();
    });
  };

  const renderRow = (block: Block, extra: React.ReactNode) => {
    const BlockIcon = ACTIVITY_ICONS[block.icon].icon;
    const pickerOpen = iconPickerFor === block.id;
    return (
      <motion.li
        key={block.id}
        layout
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-md border border-border bg-background p-2"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIconPickerFor(pickerOpen ? null : block.id)}
            aria-expanded={pickerOpen}
            aria-label={`Cambiar icono de ${block.name || "la actividad"}`}
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-md border transition-colors",
              pickerOpen
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-card text-primary hover:border-ring/60",
            )}
          >
            <BlockIcon size={20} aria-hidden />
          </button>
          <input
            value={block.name}
            onChange={(event) => update(block.id, { name: event.target.value })}
            maxLength={40}
            placeholder={block.fixedAt ? "Ej. Trabajo, clases" : "Ej. Ejercicio, estudiar"}
            aria-label="Nombre de la actividad"
            aria-invalid={block.name.trim() === "" ? true : undefined}
            className={cn(controlClass, "h-11 min-w-0 flex-1")}
          />
          <button
            type="button"
            onClick={() => togglePin(block)}
            aria-pressed={Boolean(block.fixedAt)}
            title={block.fixedAt ? "Quitar hora fija" : "Darle hora fija"}
            aria-label={block.fixedAt ? `Quitar hora fija a ${block.name}` : `Darle hora fija a ${block.name}`}
            className={cn(iconButtonClass, block.fixedAt && "text-primary")}
          >
            {block.fixedAt ? <IconPinFilled size={18} aria-hidden /> : <IconPin size={18} aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => remove(block.id)}
            disabled={blocks.length === 1}
            aria-label={`Quitar ${block.name || "actividad"}`}
            className={cn(iconButtonClass, "hover:bg-destructive/10 hover:text-destructive")}
          >
            <IconTrash size={18} aria-hidden />
          </button>
        </div>

        {pickerOpen ? (
          <div role="group" aria-label="Icono" className="mt-2 flex flex-wrap gap-1">
            {ICON_KEYS.filter((key) => key !== "sleep").map((key) => {
              const Option = ACTIVITY_ICONS[key];
              return (
                <button
                  key={key}
                  type="button"
                  title={Option.label}
                  aria-label={Option.label}
                  aria-pressed={block.icon === key}
                  onClick={() => {
                    update(block.id, { icon: key });
                    setIconPickerFor(null);
                  }}
                  className={cn(
                    "grid size-11 place-items-center rounded-md transition-colors",
                    block.icon === key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Option.icon size={20} aria-hidden />
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="mt-2 flex items-center gap-1">{extra}</div>
      </motion.li>
    );
  };

  const durationSelect = (block: Block) => {
    const durations = DURATION_OPTIONS.includes(block.duration)
      ? DURATION_OPTIONS
      : [...DURATION_OPTIONS, block.duration].sort((a, b) => a - b);
    return (
      <select
        value={block.duration}
        onChange={(event) => update(block.id, { duration: Number(event.target.value) })}
        aria-label="Duración"
        className={cn(controlClass, "h-11 w-32 shrink-0 px-2 text-sm tabular-nums")}
      >
        {durations.map((minutes) => (
          <option key={minutes} value={minutes}>
            {formatDuration(minutes)}
          </option>
        ))}
      </select>
    );
  };

  const addBlock = (pinned: boolean) =>
    setBlocks((list) => [
      ...list,
      {
        id: newId(),
        name: "",
        icon: pinned ? "work" : "focus",
        duration: pinned ? 60 : 30,
        ...(pinned ? { fixedAt: toTimeValue(wakeMinutes + 120) } : {}),
      },
    ]);

  return (
    <div className="space-y-6">
      {/* Puntos de partida: reemplazan la lista, no se guarda hasta confirmar */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Empezar desde una plantilla</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                setIconPickerFor(null);
                setBlocks(template.blocks.map((block) => ({ ...block, id: newId() })));
              }}
              className="rounded-md border border-input bg-card px-3 py-2.5 text-left transition-colors hover:border-primary hover:bg-accent/50"
            >
              <span className="block text-sm font-medium">{template.name}</span>
              <span className="block text-xs leading-snug text-muted-foreground">
                {template.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ventana del dia */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-muted px-3.5 py-3 text-sm">
        <span>
          Te levantas a las <span className="font-medium tabular-nums">{formatTime(wakeMinutes)}</span>
        </span>
        <label className="flex items-center gap-2">
          y te acuestas a las
          <input
            type="time"
            value={bedTime}
            onChange={(event) => setBedTime(event.target.value)}
            aria-invalid={!bedTime ? true : undefined}
            className={cn(controlClass, "h-11 w-32 px-2 text-sm tabular-nums")}
          />
        </label>
      </div>

      {/* 1. Lo que tiene hora */}
      <section className="space-y-2" aria-labelledby="fixed-title">
        <div>
          <h3 id="fixed-title" className="font-medium">
            Cosas fijas
          </h3>
          <p className="text-sm text-muted-foreground">
            Lo que siempre haces a la misma hora: trabajo, clases, citas.
          </p>
        </div>
        {fixed.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
            Todavía no tienes cosas fijas.
          </p>
        ) : null}
        <ol className="space-y-2">
          <AnimatePresence initial={false}>
            {fixed.map((block) =>
              renderRow(
                block,
                <>
                  <input
                    type="time"
                    value={block.fixedAt}
                    onChange={(event) =>
                      event.target.value && update(block.id, { fixedAt: event.target.value })
                    }
                    aria-label="Hora de inicio"
                    className={cn(controlClass, "h-11 w-32 shrink-0 px-2 text-sm tabular-nums")}
                  />
                  {durationSelect(block)}
                  <span className="pl-1 text-sm tabular-nums text-muted-foreground">
                    hasta {formatTime(parseTime(block.fixedAt!) + block.duration)}
                  </span>
                </>,
              ),
            )}
          </AnimatePresence>
        </ol>
        <Button
          variant="secondary"
          className="w-full"
          disabled={blocks.length >= MAX_BLOCKS}
          onClick={() => addBlock(true)}
        >
          <IconPlus size={18} aria-hidden />
          Añadir algo fijo
        </Button>
      </section>

      {/* Cuanto tiempo libre queda y cuanto falta por repartir */}
      <div role="status" className="space-y-2 rounded-md border border-border bg-card px-3.5 py-3">
        <p className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted-foreground">Tiempo libre para repartir</span>
          <span className="font-display text-xl font-semibold tabular-nums">
            {formatDuration(plan.freeTotal)}
          </span>
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300",
              overBudget > 0 ? "bg-destructive" : "bg-primary",
            )}
            style={{
              width: `${plan.freeTotal ? Math.min(100, (plan.flexibleTotal / plan.freeTotal) * 100) : 100}%`,
            }}
          />
        </div>
        <p className={cn("text-sm", overBudget > 0 ? "text-destructive" : "text-muted-foreground")}>
          {overBudget > 0 ? (
            <>
              Repartiste {formatDuration(plan.flexibleTotal)}: te pasas por{" "}
              <span className="font-medium tabular-nums">{formatDuration(overBudget)}</span>.
            </>
          ) : (
            <>
              Repartiste <span className="tabular-nums">{formatDuration(plan.flexibleTotal)}</span>. Te
              quedan{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatDuration(plan.unassigned)}
              </span>{" "}
              sin repartir, que se verán como tiempo libre.
            </>
          )}
        </p>
      </div>

      {/* 2. Como se reparte el tiempo libre */}
      <section className="space-y-2" aria-labelledby="flexible-title">
        <div>
          <h3 id="flexible-title" className="font-medium">
            Reparte tu tiempo libre
          </h3>
          <p className="text-sm text-muted-foreground">
            Elige cuánto le das a cada cosa. Cada una va al primer hueco libre donde quepa, en este orden.
          </p>
        </div>
        <ol className="space-y-2">
          <AnimatePresence initial={false}>
            {flexible.map((block, index) =>
              renderRow(
                block,
                <>
                  <span className="w-[4.5rem] shrink-0 pl-1 text-sm tabular-nums text-muted-foreground">
                    {formatTime(wakeMinutes + (startOf.get(block.id) ?? 0))}
                  </span>
                  {durationSelect(block)}
                  <span className="flex-1" />
                  <button
                    type="button"
                    onClick={() => moveFlexible(index, -1)}
                    disabled={index === 0}
                    aria-label="Subir"
                    className={iconButtonClass}
                  >
                    <IconArrowUp size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFlexible(index, 1)}
                    disabled={index === flexible.length - 1}
                    aria-label="Bajar"
                    className={iconButtonClass}
                  >
                    <IconArrowDown size={18} aria-hidden />
                  </button>
                </>,
              ),
            )}
          </AnimatePresence>
        </ol>
        <Button
          variant="secondary"
          className="w-full"
          disabled={blocks.length >= MAX_BLOCKS}
          onClick={() => addBlock(false)}
        >
          <IconPlus size={18} aria-hidden />
          Añadir actividad
        </Button>
      </section>

      {plan.problems.length > 0 ? (
        <ul
          role="alert"
          className="space-y-1 rounded-md border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          {plan.problems.map((problem) => (
            <li key={problem} className="flex items-start gap-2">
              <IconAlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
              {problem}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Sueno: de la hora de dormir a la de despertar */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-md border px-3.5 py-3 text-sm",
          sleep < RECOMMENDED_SLEEP_MINUTES
            ? "border-warning/30 bg-warning/10 text-warning"
            : "border-border bg-muted text-foreground",
        )}
      >
        {sleep < RECOMMENDED_SLEEP_MINUTES ? (
          <IconAlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
        ) : (
          <IconMoon size={18} className="mt-0.5 shrink-0" aria-hidden />
        )}
        <p>
          <span className="font-medium tabular-nums">Duermes {formatDuration(sleep)}</span>, de{" "}
          <span className="tabular-nums">{formatTime(bed)}</span> a{" "}
          <span className="tabular-nums">{formatTime(wakeMinutes)}</span>.
          {sleep < RECOMMENDED_SLEEP_MINUTES ? " Se recomiendan al menos 7 h." : null}
        </p>
      </div>

      <Button size="lg" className="w-full" onClick={onSave} loading={pending} disabled={blocked}>
        Guardar rutina
      </Button>
      {hasEmptyName ? (
        <p className="-mt-3 text-center text-sm text-muted-foreground">
          Ponle nombre a todas las actividades para guardar.
        </p>
      ) : null}
    </div>
  );
}
