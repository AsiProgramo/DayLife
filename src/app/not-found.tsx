import { IconMapOff } from "@tabler/icons-react";
import Link from "next/link";

import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-sm space-y-4 text-center">
        <IconMapOff size={40} className="mx-auto text-primary" aria-hidden />
        <h1 className="font-display text-3xl font-semibold leading-tight">No encontramos esa página</h1>
        <p className="leading-relaxed text-muted-foreground">
          Puede que la imagen se haya eliminado o que el enlace esté incompleto.
        </p>
        <Link href="/" className={buttonClass("primary", "lg")}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
