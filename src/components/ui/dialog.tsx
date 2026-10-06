"use client";

import { IconX } from "@tabler/icons-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Dialogo modal sobre el elemento nativo <dialog>: el navegador se encarga de
 * atrapar el foco, cerrar con Escape y devolver el foco al cerrar.
 */
export function Dialog({ open, onClose, title, description, children, className }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        // clic en el fondo (fuera del panel)
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-border bg-card p-0 text-card-foreground shadow-soft",
        "backdrop:bg-foreground/50 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {open ? (
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 id={titleId} className="font-display text-xl font-semibold leading-tight">
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-2 -mt-2 grid size-11 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <IconX size={20} aria-hidden />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
