import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-success-hover bg-success text-white hover:bg-success-hover disabled:border-border-default disabled:bg-surface-overlay disabled:text-muted",
  secondary:
    "bg-surface-overlay text-fg hover:bg-border-default disabled:bg-surface disabled:text-muted",
  ghost: "bg-transparent text-fg hover:bg-surface-overlay disabled:text-muted",
  outline:
    "border border-border-default bg-surface text-fg hover:bg-surface-overlay hover:border-muted disabled:bg-surface disabled:text-muted",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-8 px-3 text-xs",
  md: "min-h-9 px-4 text-sm",
  lg: "min-h-10 px-5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
