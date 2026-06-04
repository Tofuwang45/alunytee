import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "muted" | "primary";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border border-border-default bg-surface-overlay text-fg",
  success: "border border-success/40 bg-success/20 text-[#3fb950]",
  muted: "border border-border-muted bg-canvas text-muted",
  primary: "border border-accent/40 bg-accent/20 text-accent-fg",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
