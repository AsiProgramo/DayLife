import { IconLoader2 } from "@tabler/icons-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "md" | "lg" | "icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90",
  secondary: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-11",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md"): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium",
    "transition duration-200 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  type = "button",
  disabled,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(buttonClass(variant, size), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <IconLoader2 size={18} className="animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
