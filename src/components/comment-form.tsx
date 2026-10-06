"use client";

import { IconSend } from "@tabler/icons-react";
import { useActionState, useEffect } from "react";
import { sileo } from "sileo";

import { addComment } from "@/actions/images";
import type { FormState } from "@/lib/validation";

import { TextareaField } from "./ui/field";
import { FormMessage } from "./ui/form-message";
import { SubmitButton } from "./ui/submit-button";

const initial: FormState = {};

export function CommentForm({ imageId }: { imageId: string }) {
  const [state, action] = useActionState(addComment.bind(null, imageId), initial);

  useEffect(() => {
    if (state.ok) sileo.success({ title: "Comentario publicado" });
  }, [state]);

  return (
    <form action={action} className="space-y-3">
      <FormMessage message={state.message} />
      <TextareaField
        label="Tu comentario"
        name="comment"
        rows={2}
        maxLength={500}
        placeholder="Escribe algo amable"
        defaultValue={state.ok ? "" : state.values?.comment}
        error={state.fieldErrors?.comment}
        required
      />
      <SubmitButton variant="secondary">
        <IconSend size={18} aria-hidden />
        Comentar
      </SubmitButton>
    </form>
  );
}
