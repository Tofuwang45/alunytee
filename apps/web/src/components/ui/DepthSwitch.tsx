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
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted">Explain for</span>
      <div className="inline-flex rounded-md border border-border-default bg-canvas p-0.5">
        {DEPTH_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            title={level.hint}
            onClick={() => onChange(level.id)}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition",
              value === level.id ? "bg-surface-overlay text-fg" : "text-muted hover:text-fg",
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
