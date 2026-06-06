"use client";

import { FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ActiveSource, FileReference } from "./types";

function fileName(path: string) {
  return path.split("/").pop() ?? path;
}

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

  const lineSuffix =
    startLine != null && endLine != null
      ? `:${startLine}-${endLine}`
      : startLine != null
        ? `:${startLine}`
        : "";

  const label = children ?? `${fileName(filePath)}${lineSuffix}`;

  return (
    <button
      type="button"
      onClick={() => onSelect({ filePath, startLine: startLine ?? null, endLine: endLine ?? null })}
      title={`${filePath}${lineSuffix}`}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[11px] backdrop-blur-md transition",
        isActive
          ? "glass-glow-ring border-sky-400/50 bg-sky-500/15 text-sky-300"
          : "border-glass-border bg-white/[0.06] text-sky-300/90 hover:bg-white/10",
      )}
    >
      <FileCode2 className="h-3 w-3 shrink-0" />
      <span className="truncate">{label}</span>
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
    return <p className="text-xs text-muted">References appear after the first answer.</p>;
  }

  return (
    <div className="space-y-1.5">
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
              "w-full rounded-lg border p-2.5 text-left backdrop-blur-md transition",
              isActive
                ? "glass-glow-ring border-sky-400/40 bg-sky-500/10"
                : "border-glass-border bg-white/[0.04] hover:bg-white/[0.08]",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-[11px] font-medium text-fg" title={reference.filePath}>
                  {fileName(reference.filePath)}
                </div>
                <div className="mt-0.5 truncate text-[10px] text-muted" title={reference.filePath}>
                  {reference.filePath}
                </div>
                {reference.startLine != null ? (
                  <div className="mt-0.5 text-[10px] text-muted">
                    L{reference.startLine}–{reference.endLine}
                  </div>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
