import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

type Props = { name: string; size?: "sm" | "md"; className?: string };

/** Avatar con iniciales: sin servicios externos ni datos del email. */
export function Avatar({ name, size = "md", className }: Props) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-accent font-semibold text-accent-foreground",
        size === "sm" ? "size-7 text-[11px]" : "size-10 text-sm",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
