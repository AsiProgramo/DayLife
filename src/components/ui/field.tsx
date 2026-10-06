import { IconAlertCircle } from "@tabler/icons-react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export const controlClass = cn(
  "w-full rounded-md border border-input bg-card px-3.5 text-base text-foreground",
  "placeholder:text-muted-foreground/70 transition-colors duration-200",
  "hover:border-ring/60 aria-[invalid=true]:border-destructive",
);

type Common = { label: string; error?: string; hint?: string; trailing?: ReactNode };

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-destructive">
      <IconAlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
      {error}
    </p>
  );
}

export function Field({
  label,
  error,
  hint,
  trailing,
  id,
  name,
  className,
  ...props
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = id ?? name ?? label;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(controlClass, "h-12", trailing ? "pr-12" : null, className)}
          {...props}
        />
        {trailing ? <div className="absolute inset-y-0 right-0.5 flex items-center">{trailing}</div> : null}
      </div>
      {hint && !error ? (
        <p id={`${fieldId}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${fieldId}-error`} error={error} />
    </div>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  id,
  name,
  className,
  ...props
}: Omit<Common, "trailing"> & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldId = id ?? name ?? label;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(controlClass, "min-h-24 resize-y py-3 leading-relaxed", className)}
        {...props}
      />
      {hint && !error ? (
        <p id={`${fieldId}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${fieldId}-error`} error={error} />
    </div>
  );
}
