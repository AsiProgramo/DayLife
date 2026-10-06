"use client";

import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconMoon,
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
  MAX_ROUTINE_MINUTES,
  RECOMMENDED_SLEEP_MINUTES,
  TEMPLATES,
  totalMinutes,
  type Block,
} from "@/lib/schedule";

import { ACTIVITY_ICONS } from "./activity-icons";
import { Button } from "./ui/button";
import { controlClass } from "./ui/field";

const newId = (): string => crypto.randomUUID().replace(/-/g, "").slice(0, 12);

const iconButtonClass =
  "grid size-11 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

type Props = { blocks: Block[]; wakeMinutes: number; onSaved: () => void };

export function RoutineEditor({ blocks: initial, wakeMinutes, onSaved }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = totalMinutes(blocks);
  const sleep = 1440 - total;
  const tooLong = total > MAX_ROUTINE_MINUTES;
  const hasEmptyName = blocks.some((block) => block.name.trim() === "");

  const update = (id: string, patch: Partial<Block>) =>
    setBlocks((list) => list.map((block) => (block.id === id ? { ...block, ...patch } : block)));

  const move = (index: number, direction: -1 | 1) =>
    setBlocks((list) => {
      const next = [...list];
      const target = index + direction;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const onSave = () => {
    startTransition(async () => {
      const result = await saveRoutine(
        blocks.map((block) => ({ ...block, name: block.name.trim() })),
      );
      if (result.error) {
        sileo.error({ title: "No se guardó la rutina", description: result.error });
        return;
      }
      sileo.success({ title: "Rutina guardada", description: "Tu horario ya está actualizado." });
      onSaved();
    });
  };

  let start = 0;

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

      <ol className="space-y-2">
        <AnimatePresence initial={false}>
          {blocks.map((block, index) => {
            const blockStart = start;
            start += block.duration;
            const BlockIcon = ACTIVITY_ICONS[block.icon].icon;
            const pickerOpen = iconPickerFor === block.id;
            const durations = DURATION_OPTIONS.includes(block.duration)
              ? DURATION_OPTIONS
              : [...DURATION_OPTIONS, block.duration].sort((a, b) => a - b);
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
                    placeholder="Nombre de la actividad"
                    aria-label="Nombre de la actividad"
                    aria-invalid={block.name.trim() === "" ? true : undefined}
                    className={cn(controlClass, "h-11 min-w-0 flex-1")}
                  />
                  <button
                    type="button"
                    onClick={() => setBlocks((list) => list.filter((item) => item.id !== block.id))}
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

                <div className="mt-2 flex items-center gap-1">
                  <span className="w-[4.5rem] shrink-0 pl-1 text-sm tabular-nums text-muted-foreground">
                    {formatTime(wakeMinutes + blockStart)}
                  </span>
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
                  <span className="flex-1" />
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Subir"
                    className={iconButtonClass}
                  >
                    <IconArrowUp size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === blocks.length - 1}
                    aria-label="Bajar"
                    className={iconButtonClass}
                  >
                    <IconArrowDown size={18} aria-hidden />
                  </button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      <Button
        variant="secondary"
        className="w-full"
        disabled={blocks.length >= MAX_BLOCKS}
        onClick={() =>
          setBlocks((list) => [...list, { id: newId(), name: "", icon: "focus", duration: 30 }])
        }
      >
        <IconPlus size={18} aria-hidden />
        Añadir actividad
      </Button>

      {/* Lo que queda del dia es sueno: el dato que cambia con cada ajuste */}
      <div
        role="status"
        className={cn(
          "flex items-start gap-3 rounded-md border px-3.5 py-3 text-sm",
          tooLong
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : sleep < RECOMMENDED_SLEEP_MINUTES
              ? "border-warning/30 bg-warning/10 text-warning"
              : "border-border bg-muted text-foreground",
        )}
      >
        {tooLong || sleep < RECOMMENDED_SLEEP_MINUTES ? (
          <IconAlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
        ) : (
          <IconMoon size={18} className="mt-0.5 shrink-0" aria-hidden />
        )}
        {tooLong ? (
          <p>
            La rutina ocupa {formatDuration(total)} y no deja tiempo para dormir. Acorta o quita
            alguna actividad.
          </p>
        ) : (
          <p>
            <span className="font-medium tabular-nums">Duermes {formatDuration(sleep)}</span>, de{" "}
            <span className="tabular-nums">{formatTime(wakeMinutes + total)}</span> a{" "}
            <span className="tabular-nums">{formatTime(wakeMinutes)}</span>.
            {sleep < RECOMMENDED_SLEEP_MINUTES ? " Se recomiendan al menos 7 h." : null}
          </p>
        )}
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={onSave}
        loading={pending}
        disabled={tooLong || hasEmptyName}
      >
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
