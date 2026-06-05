import { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type GlassVariant = "default" | "strong" | "subtle";

const variantClasses: Record<GlassVariant, string> = {
  default: "glass rounded-2xl",
  strong: "glass-strong rounded-2xl",
  subtle: "glass-subtle rounded-xl",
};

export function GlassPanel<T extends ElementType = "div">({
  as,
  variant = "default",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: T;
  variant?: GlassVariant;
}) {
  const Component = as ?? "div";
  return (
    <Component className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Component>
  );
}
