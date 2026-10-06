import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth-forms";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
          Hola de nuevo
        </h1>
        <p className="leading-relaxed text-muted-foreground">
          Entra para ver qué toca ahora en tu día.
        </p>
      </header>
      <LoginForm />
    </div>
  );
}
