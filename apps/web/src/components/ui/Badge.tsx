import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "muted" | "primary";

const variantClasses: Record<BadgeVariant, string> = {
  default: "glass-subtle border-glass-border text-fg",
  success: "border border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
  muted: "glass-subtle border-border-muted text-muted",
  primary: "border border-sky-400/30 bg-sky-500/15 text-sky-300",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
