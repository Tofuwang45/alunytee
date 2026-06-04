"use client";

import { FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ActiveSource, FileReference } from "./types";

export default function CitationLink({
  filePath,
  startLine,
  endLine,
  activeSource,
  onSelect,
  children,
}: {
  filePath: string;
  startLine?: number | null;
  endLine?: number | null;
  activeSource: ActiveSource | null;
  onSelect: (source: ActiveSource) => void;
  children?: React.ReactNode;
}) {
  const isActive =
    activeSource?.filePath === filePath &&
    activeSource?.startLine === (startLine ?? null) &&
    activeSource?.endLine === (endLine ?? null);

  const label =
    children ??
    (startLine != null && endLine != null
      ? `${filePath}:${startLine}-${endLine}`
      : startLine != null
        ? `${filePath}:${startLine}`
        : filePath);

  return (
    <button
      type="button"
      onClick={() => onSelect({ filePath, startLine: startLine ?? null, endLine: endLine ?? null })}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-xs transition",
        isActive
          ? "border-accent bg-accent/20 text-accent-fg"
          : "border-border-default bg-surface-overlay text-accent-fg hover:border-accent",
      )}
    >
      <FileCode2 className="h-3 w-3 shrink-0" />
      <span className="break-all">{label}</span>
    </button>
  );
}

export function FileReferenceList({
  references,
  activeSource,
  onSelect,
}: {
  references: FileReference[];
  activeSource: ActiveSource | null;
  onSelect: (source: ActiveSource) => void;
}) {
  if (!references.length) {
    return <p className="text-sm text-muted">References appear after the first answer.</p>;
  }

  return (
    <div className="space-y-2">
      {references.map((reference) => {
        const isActive =
          activeSource?.filePath === reference.filePath &&
          activeSource?.startLine === reference.startLine &&
          activeSource?.endLine === reference.endLine;

        return (
          <button
            key={`${reference.filePath}-${reference.startLine}-${reference.endLine}`}
            type="button"
            onClick={() =>
              onSelect({
                filePath: reference.filePath,
                startLine: reference.startLine,
                endLine: reference.endLine,
              })
            }
            className={cn(
              "w-full rounded-md border p-3 text-left transition",
              isActive
                ? "border-accent bg-accent/10"
                : "border-border-default bg-canvas hover:border-muted hover:bg-surface-overlay",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="break-all font-mono text-xs font-medium text-fg">{reference.filePath}</div>
                <div className="mt-1 text-xs text-muted">
                  {reference.startLine != null
                    ? `Lines ${reference.startLine}–${reference.endLine}`
                    : "Full file"}
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-border-default bg-surface-overlay px-2 py-0.5 text-[10px] font-medium text-muted">
                {Math.round(reference.score * 10) / 10}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
