"use client";

import { useActionState, useEffect, useState } from "react";
import { sileo } from "sileo";

import { setWakeTime } from "@/actions/settings";
import { cn } from "@/lib/cn";
import { formatTime, parseTime } from "@/lib/schedule";
import type { FormState } from "@/lib/validation";

import { controlClass, FieldError } from "./ui/field";
import { SubmitButton } from "./ui/submit-button";

// Las horas mas habituales como opciones directas; cualquier otra, en el campo.
const PRESETS = ["05:00", "06:00", "07:00", "08:00"];
const initial: FormState = {};

type Props = { current: string | null; submitLabel: string; onSaved?: () => void };

export function WakeTimeForm({ current, submitLabel, onSaved }: Props) {
  const [state, action] = useActionState(setWakeTime, initial);
  const [value, setValue] = useState(current ?? "07:00");

  useEffect(() => {
    if (!state.ok) return;
    sileo.success({
      title: "Horario actualizado",
      description: `Tu día empieza a las ${formatTime(parseTime(state.values?.wakeTime ?? "07:00"))}.`,
    });
    onSaved?.();
    // solo al cambiar el resultado de la accion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">¿A qué hora te despiertas?</legend>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-pressed={value === preset}
              onClick={() => setValue(preset)}
              className={cn(
                "h-12 rounded-md border text-sm font-medium tabular-nums transition-colors duration-200",
                value === preset
                  ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                  : "border-input bg-card text-muted-foreground hover:border-ring/60 hover:text-foreground",
              )}
            >
              {formatTime(parseTime(preset))}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="wakeTime" className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
            Otra hora
          </label>
          <input
            id="wakeTime"
            name="wakeTime"
            type="time"
            required
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-invalid={state.fieldErrors?.wakeTime ? true : undefined}
            aria-describedby={state.fieldErrors?.wakeTime ? "wakeTime-error" : undefined}
            className={cn(controlClass, "h-12 w-36 tabular-nums")}
          />
        </div>
        <FieldError id="wakeTime-error" error={state.fieldErrors?.wakeTime} />
      </fieldset>

      <SubmitButton size="lg" className="w-full">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
