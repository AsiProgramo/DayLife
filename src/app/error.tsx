"use client";

import { IconRefresh } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

// No se muestra el detalle del error: en produccion Next ya lo oculta al cliente.
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-sm space-y-4 text-center">
        <h1 className="font-display text-3xl font-semibold leading-tight">Algo salió mal</h1>
        <p className="leading-relaxed text-muted-foreground">
          No pudimos cargar esta pantalla. Tus datos están a salvo; vuelve a intentarlo.
        </p>
        <Button size="lg" onClick={reset}>
          <IconRefresh size={18} aria-hidden />
          Reintentar
        </Button>
      </div>
    </main>
  );
}
