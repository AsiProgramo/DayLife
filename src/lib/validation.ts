import { z } from "zod";

import { ICON_KEYS, MAX_BLOCKS, MAX_ROUTINE_MINUTES } from "./schedule";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "El email es demasiado largo")
  .pipe(z.email("Escribe un email válido"));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Escribe tu contraseña").max(72, "Contraseña demasiado larga"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Escribe al menos 2 caracteres").max(40, "Máximo 40 caracteres"),
  email: emailSchema,
  // bcrypt ignora todo lo que pase de 72 bytes
  password: z
    .string()
    .min(8, "Usa al menos 8 caracteres")
    .refine((v) => new TextEncoder().encode(v).length <= 72, "Máximo 72 caracteres"),
});

export const imageSchema = z.object({
  title: z.string().trim().min(1, "Ponle un título").max(80, "Máximo 80 caracteres"),
  description: z.string().trim().max(500, "Máximo 500 caracteres"),
});

export const commentSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(1, "Escribe un comentario")
    .max(500, "Máximo 500 caracteres"),
});

export const wakeTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Elige una hora válida");

export const blockIdSchema = z.string().regex(/^[a-z0-9]{3,16}$/);

export const routineSchema = z
  .array(
    z.object({
      id: blockIdSchema,
      name: z.string().trim().min(1, "Ponle un nombre").max(40, "Máximo 40 caracteres"),
      icon: z.enum(ICON_KEYS),
      duration: z.number().int().min(5).max(720).multipleOf(5),
    }),
  )
  .min(1, "Añade al menos una actividad")
  .max(MAX_BLOCKS, `Máximo ${MAX_BLOCKS} actividades`)
  .refine((blocks) => new Set(blocks.map((b) => b.id)).size === blocks.length, "Actividades duplicadas")
  .refine(
    (blocks) => blocks.reduce((sum, b) => sum + b.duration, 0) <= MAX_ROUTINE_MINUTES,
    "La rutina no deja tiempo para dormir. Acorta alguna actividad.",
  );

export const dayKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/);

export type FieldErrors = Record<string, string>;

/** Primer mensaje de error de cada campo, para mostrarlo junto al input. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type FormState = {
  message?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
  ok?: boolean;
};
