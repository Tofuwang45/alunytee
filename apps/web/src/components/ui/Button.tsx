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
    "border border-sky-400/35 bg-gradient-to-br from-sky-500/95 via-indigo-600/95 to-violet-600/95 text-white font-semibold shadow-[0_2px_20px_var(--accent-glow)] backdrop-blur-sm hover:brightness-110 disabled:from-zinc-800/90 disabled:to-zinc-900/90 disabled:border-white/5 disabled:text-zinc-500 disabled:shadow-none",
  secondary:
    "glass text-fg hover:bg-white/10 disabled:opacity-40",
  ghost: "bg-transparent text-muted backdrop-blur-sm hover:bg-white/8 hover:text-fg disabled:opacity-40",
  outline:
    "glass border-glass-border text-fg hover:bg-white/10 hover:border-glass-highlight disabled:opacity-40",
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
