"use client";

import { useEffect, useState } from "react";
import { StructuredAnswer as StructuredAnswerType } from "@/lib/ai/structured";
import { highlightCode } from "@/lib/shiki/highlighter";
import CitationLink from "./CitationLink";
import { ActiveSource, FileReference } from "./types";

function SnippetBlock({
  snippet,
  activeSource,
  onSelectSource,
}: {
  snippet: StructuredAnswerType["snippets"][0];
  activeSource: ActiveSource | null;
  onSelectSource: (source: ActiveSource) => void;
}) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    highlightCode(snippet.code, snippet.language).then(setHtml);
  }, [snippet.code, snippet.language]);

  const source: ActiveSource | null = snippet.filePath
    ? {
        filePath: snippet.filePath,
        startLine: snippet.startLine ?? null,
        endLine: snippet.endLine ?? null,
      }
    : null;

  return (
    <div className="overflow-hidden rounded-md border border-border-default bg-code-bg">
      {snippet.filePath ? (
        <button
          type="button"
          onClick={() => source && onSelectSource(source)}
          className="flex w-full items-center border-b border-border-muted px-3 py-1.5 text-left"
        >
          <CitationLink
            filePath={snippet.filePath}
            startLine={snippet.startLine ?? null}
            endLine={snippet.endLine ?? null}
            activeSource={activeSource}
            onSelect={onSelectSource}
          />
        </button>
      ) : null}
      {html ? (
        <div
          className="overflow-x-auto p-3 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!text-xs [&_code]:!leading-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-3">
          <code className="text-xs leading-5 text-fg">{snippet.code}</code>
        </pre>
      )}
    </div>
  );
}

export default function StructuredAnswerView({
  structured,
  references,
  activeSource,
  onSelectSource,
}: {
  structured: StructuredAnswerType;
  references: FileReference[];
  activeSource: ActiveSource | null;
  onSelectSource: (source: ActiveSource) => void;
}) {
  return (
    <div className="space-y-3 text-sm">
      <p className="font-medium leading-6 text-fg">{structured.summary}</p>

      {structured.keyPoints.length > 0 ? (
        <ul className="space-y-1.5 text-muted">
          {structured.keyPoints.map((point) => (
            <li key={point} className="flex gap-2 leading-5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-fg" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {structured.steps.length > 0 ? (
        <ol className="list-decimal space-y-1 pl-5 text-muted">
          {structured.steps.map((step) => (
            <li key={step} className="leading-5">
              {step}
            </li>
          ))}
        </ol>
      ) : null}

      {structured.snippets.length > 0 ? (
        <div className="space-y-2">
          {structured.snippets.map((snippet, i) => (
            <SnippetBlock
              key={`${snippet.filePath ?? "snip"}-${i}`}
              snippet={snippet}
              activeSource={activeSource}
              onSelectSource={onSelectSource}
            />
          ))}
        </div>
      ) : null}

      {references.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {references.slice(0, 5).map((ref) => (
            <CitationLink
              key={`${ref.filePath}:${ref.startLine}`}
              filePath={ref.filePath}
              startLine={ref.startLine}
              endLine={ref.endLine}
              activeSource={activeSource}
              onSelect={onSelectSource}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
