"use client";

import { DEPTH_LEVELS, DepthLevel } from "@/lib/ai/depth";
import { cn } from "@/lib/utils/cn";

const SHORT_LABELS: Record<DepthLevel, string> = {
  plain: "Plain",
  product: "PM",
  developer: "Dev",
  deep: "Deep",
};

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
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
        Explain for
      </span>
      <div className="glass inline-flex max-w-full overflow-x-auto rounded-full p-0.5">
        {DEPTH_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            title={level.hint}
            onClick={() => onChange(level.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition backdrop-blur-sm",
              value === level.id
                ? "bg-white/15 text-fg shadow-[0_0_12px_var(--accent-glow)] ring-1 ring-sky-400/35"
                : "text-muted hover:bg-white/8 hover:text-fg",
            )}
          >
            <span className="hidden sm:inline">{level.label}</span>
            <span className="sm:hidden">{SHORT_LABELS[level.id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
