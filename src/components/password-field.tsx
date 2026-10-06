"use client";

import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState, type ComponentProps } from "react";

import { Field } from "./ui/field";

type Props = Omit<ComponentProps<typeof Field>, "type" | "trailing">;

/** Campo de contrasena con boton para verla: evita pedirla dos veces. */
export function PasswordField(props: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          {visible ? <IconEyeOff size={20} aria-hidden /> : <IconEye size={20} aria-hidden />}
        </button>
      }
    />
  );
}
