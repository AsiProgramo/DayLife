import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth-forms";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function SignupPage() {
  if (await getSessionUser()) redirect("/");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
          Crea tu cuenta
        </h1>
        <p className="leading-relaxed text-muted-foreground">
          En un minuto tendrás tu horario del día armado.
        </p>
      </header>
      <SignupForm />
    </div>
  );
}
