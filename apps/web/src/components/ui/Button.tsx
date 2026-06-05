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
    "border border-white/20 bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-white shadow-[0_4px_20px_var(--accent-glow)] hover:brightness-110 disabled:from-zinc-600 disabled:to-zinc-700 disabled:border-white/10 disabled:text-zinc-400 disabled:shadow-none",
  secondary:
    "glass text-fg hover:bg-white/10 disabled:opacity-50",
  ghost: "bg-transparent text-fg hover:bg-white/8 disabled:opacity-50",
  outline:
    "glass border-glass-border text-fg hover:bg-white/8 hover:border-glass-highlight disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-8 px-4 text-xs rounded-full",
  md: "min-h-9 px-5 text-sm rounded-full",
  lg: "min-h-11 px-6 text-sm rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
