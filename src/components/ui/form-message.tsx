import { IconAlertTriangle } from "@tabler/icons-react";

/** Error general de un formulario (credenciales, limite de intentos...). */
export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
    >
      <IconAlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
