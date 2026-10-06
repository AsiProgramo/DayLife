"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "./button";

/** Boton de envio que muestra el estado de carga del formulario que lo contiene. */
export function SubmitButton(props: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending} {...props} />;
}
