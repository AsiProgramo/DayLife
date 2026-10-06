"use client";

import { IconPhotoPlus, IconPlus, IconUpload } from "@tabler/icons-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { createImage } from "@/actions/images";
import { cn } from "@/lib/cn";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import type { FormState } from "@/lib/validation";

import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Field, FieldError, TextareaField } from "./ui/field";
import { FormMessage } from "./ui/form-message";
import { SubmitButton } from "./ui/submit-button";

const initial: FormState = {};

type Props = { variant?: "header" | "empty" };

export function UploadDialog({ variant = "header" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "header" ? (
        <Button onClick={() => setOpen(true)} className="px-3 sm:px-4">
          <IconPlus size={18} aria-hidden />
          <span>Compartir</span>
        </Button>
      ) : (
        <Button size="lg" onClick={() => setOpen(true)} className="glow">
          <IconPhotoPlus size={20} aria-hidden />
          Compartir el primer momento
        </Button>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Compartir un momento"
        description="Una foto de tu día: tu desayuno, tu entrenamiento, tu lugar de trabajo."
      >
        <UploadForm />
      </Dialog>
    </>
  );
}

// El formulario tiene la forma de la tarjeta final: imagen arriba, titulo y descripcion.
function UploadForm() {
  const [state, action] = useActionState(createImage, initial);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Tras un envio con errores React reinicia el formulario (el archivo se pierde):
  // se quita tambien la vista previa para no aparentar que sigue adjunto.
  useEffect(() => {
    setPreview(null);
  }, [state]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const imageError = fileError ?? state.fieldErrors?.image;

  return (
    <form action={action} className="space-y-5">
      <FormMessage message={state.message} />

      <div className="space-y-1.5">
        <label
          htmlFor="image"
          className={cn(
            "relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-md border-2 border-dashed text-center transition-colors",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card",
            imageError
              ? "border-destructive bg-destructive/5"
              : "border-input bg-muted/50 hover:border-primary hover:bg-accent/50",
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:)
            <img
              src={preview}
              alt="Vista previa"
              className="absolute inset-0 size-full object-cover"
              onError={() => {
                if (inputRef.current) inputRef.current.value = "";
                setPreview(null);
                setFileError("No pudimos leer ese archivo como imagen. Elige un PNG, JPG, GIF o WebP.");
              }}
            />
          ) : (
            <>
              <IconUpload size={28} className="text-primary" aria-hidden />
              <span className="font-medium">Elige una imagen</span>
              <span className="text-sm text-muted-foreground">PNG, JPG, GIF o WebP · hasta 8 MB</span>
            </>
          )}
          {preview ? (
            <span className="absolute bottom-3 rounded-full bg-background/90 px-3 py-1.5 text-sm font-medium shadow-soft">
              Cambiar imagen
            </span>
          ) : null}
          <input
            ref={inputRef}
            id="image"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            required
            aria-invalid={imageError ? true : undefined}
            aria-describedby={imageError ? "image-error" : undefined}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFileError(undefined);
              if (!file) return setPreview(null);
              if (file.size > MAX_UPLOAD_BYTES) {
                event.target.value = "";
                setPreview(null);
                return setFileError("La imagen pesa más de 8 MB. Elige una más ligera.");
              }
              setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
        <FieldError id="image-error" error={imageError} />
      </div>

      <Field
        label="Título"
        name="title"
        placeholder="Desayuno después de entrenar"
        maxLength={80}
        defaultValue={state.values?.title}
        error={state.fieldErrors?.title}
        required
      />
      <TextareaField
        label="Descripción (opcional)"
        name="description"
        rows={2}
        maxLength={500}
        placeholder="Cuenta qué estabas haciendo"
        defaultValue={state.values?.description}
        error={state.fieldErrors?.description}
      />

      <SubmitButton size="lg" className="w-full">
        Publicar
      </SubmitButton>
    </form>
  );
}
