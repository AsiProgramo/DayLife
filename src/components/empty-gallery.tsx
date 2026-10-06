import { UploadDialog } from "./upload-dialog";

/** Estado vacio (aun no hay datos): ilustracion + beneficio + primer paso. */
export function EmptyGallery() {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-input bg-card px-6 py-14 text-center">
      <svg viewBox="0 0 200 140" className="mb-6 h-32 w-auto" role="img" aria-label="">
        <rect x="42" y="30" width="116" height="88" rx="12" className="fill-muted stroke-border" strokeWidth="2" />
        <rect x="26" y="18" width="116" height="88" rx="12" className="fill-card stroke-border" strokeWidth="2" />
        <circle cx="62" cy="48" r="11" className="fill-primary/80" />
        <path d="M36 96l28-30 20 20 16-14 32 24v0a10 10 0 0 1-10 10H46a10 10 0 0 1-10-10z" className="fill-primary/20" />
        <circle cx="160" cy="34" r="18" className="fill-accent" />
        <path d="M160 26v16M152 34h16" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h3 className="font-display text-xl font-semibold leading-tight">
        Todavía nadie ha compartido su día
      </h3>
      <p className="mb-6 mt-2 max-w-sm leading-relaxed text-muted-foreground">
        Sube una foto de tu rutina y ayuda a otros a encontrar ideas para la suya.
      </p>
      <UploadDialog variant="empty" />
    </div>
  );
}
