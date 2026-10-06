"use client";

import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useActionState } from "react";

import { login, signup } from "@/actions/auth";
import type { FormState } from "@/lib/validation";

import { PasswordField } from "./password-field";
import { Field } from "./ui/field";
import { FormMessage } from "./ui/form-message";
import { SubmitButton } from "./ui/submit-button";

const initial: FormState = {};

export function LoginForm() {
  const [state, action] = useActionState(login, initial);
  return (
    <form action={action} className="space-y-6" noValidate>
      <FormMessage message={state.message} />
      <div className="space-y-4">
        <Field
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@email.com"
          defaultValue={state.values?.email}
          error={state.fieldErrors?.email}
          required
          autoFocus
        />
        <PasswordField
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          error={state.fieldErrors?.password}
          required
        />
      </div>
      <SubmitButton size="lg" className="w-full">
        Entrar
        <IconArrowRight size={18} aria-hidden />
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/crear" className="font-medium text-primary underline-offset-4 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signup, initial);
  return (
    <form action={action} className="space-y-6" noValidate>
      <FormMessage message={state.message} />
      <div className="space-y-4">
        <Field
          label="Nombre"
          name="name"
          autoComplete="given-name"
          placeholder="Como quieres que te vean"
          maxLength={40}
          defaultValue={state.values?.name}
          error={state.fieldErrors?.name}
          required
          autoFocus
        />
        <Field
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@email.com"
          defaultValue={state.values?.email}
          error={state.fieldErrors?.email}
          required
        />
        <PasswordField
          label="Contraseña"
          name="password"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres."
          minLength={8}
          error={state.fieldErrors?.password}
          required
        />
      </div>
      <div className="space-y-3">
        <SubmitButton size="lg" className="w-full">
          Crear mi cuenta
          <IconArrowRight size={18} aria-hidden />
        </SubmitButton>
        <p className="text-center text-sm text-muted-foreground">
          Gratis. Solo necesitas un email.
        </p>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
