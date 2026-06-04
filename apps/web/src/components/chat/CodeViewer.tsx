"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { highlightCode } from "@/lib/shiki/highlighter";
import { languageFromPath } from "@/lib/repo/github-links";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";

type CodeViewerProps = {
  content: string;
  language?: string | null;
  filePath?: string;
  startLine?: number | null;
  endLine?: number | null;
  githubUrl?: string;
  className?: string;
};

export default function CodeViewer({
  content,
  language,
  filePath,
  startLine,
  endLine,
  githubUrl,
  className,
}: CodeViewerProps) {
  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);

  const lang = language ?? (filePath ? languageFromPath(filePath) : "text");
  const lines = content.split(/\r?\n/);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    highlightCode(content, lang).then((result) => {
      if (!cancelled) {
        setHtml(result);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [content, lang]);

  useEffect(() => {
    if (!highlightRef.current || startLine == null || startLine <= 0) return;
    const lineEl = highlightRef.current.querySelector(`[data-line="${startLine}"]`);
    lineEl?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [html, startLine]);

  async function copyContent() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-2 p-4", className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border-default bg-canvas-inset px-3 py-2">
        <span className="truncate font-mono text-xs text-muted">
          {filePath ?? "source"}
          {startLine != null && endLine != null ? ` · L${startLine}–${endLine}` : null}
        </span>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="sm" onClick={copyContent} className="text-muted hover:bg-surface-overlay hover:text-fg">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          {githubUrl ? (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-muted hover:bg-surface-overlay hover:text-fg">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          ) : null}
        </div>
      </div>
      <div className="max-h-[min(60vh,480px)] overflow-auto bg-[var(--code-bg)]">
        <div className="flex min-w-0">
          <div className="sticky left-0 shrink-0 select-none border-r border-border-default bg-canvas-inset py-3 pr-3 pl-3 text-right font-mono text-xs leading-5 text-muted">
            {lines.map((_, index) => {
              const lineNum = index + 1;
              const isHighlighted =
                startLine != null &&
                endLine != null &&
                lineNum >= startLine &&
                lineNum <= endLine;
              return (
                <div
                  key={lineNum}
                  data-line={lineNum}
                  className={cn(isHighlighted && "font-medium text-accent-fg")}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>
          <div
            ref={highlightRef}
            className="min-w-0 flex-1 overflow-x-auto py-3 pr-4 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!text-xs [&_code]:!leading-5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
