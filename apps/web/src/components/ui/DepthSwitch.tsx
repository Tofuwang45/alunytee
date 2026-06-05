"use client";

import { DEPTH_LEVELS, DepthLevel } from "@/lib/ai/depth";
import { cn } from "@/lib/utils/cn";

export default function DepthSwitch({
  value,
  onChange,
  className,
}: {
  value: DepthLevel;
  onChange: (next: DepthLevel) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex flex-col gap-1.5", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
        Explain for
      </span>
      <div className="glass inline-flex rounded-full p-1">
        {DEPTH_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            title={level.hint}
            onClick={() => onChange(level.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              value === level.id
                ? "bg-white/15 text-fg shadow-[0_0_10px_var(--accent-glow)]"
                : "text-muted hover:text-fg",
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
