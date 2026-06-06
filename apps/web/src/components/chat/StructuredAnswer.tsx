"use client";

import { useEffect, useState } from "react";
import { StructuredAnswer as StructuredAnswerType } from "@/lib/ai/structured";
import { highlightCode } from "@/lib/shiki/highlighter";
import CitationLink from "./CitationLink";
import { ActiveSource } from "./types";

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
    <div className="glass-subtle overflow-hidden rounded-xl backdrop-blur-md">
      {snippet.filePath ? (
        <button
          type="button"
          onClick={() => source && onSelectSource(source)}
          className="flex w-full items-center border-b border-glass-border bg-code-bg px-3 py-2 text-left"
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
      <div className="max-h-44 overflow-y-auto">
        {html ? (
          <div
            className="overflow-x-auto p-3 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!text-[11px] [&_code]:!leading-5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="overflow-x-auto p-3">
            <code className="text-[11px] leading-5 text-fg">{snippet.code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

export default function StructuredAnswerView({
  structured,
  activeSource,
  onSelectSource,
}: {
  structured: StructuredAnswerType;
  activeSource: ActiveSource | null;
  onSelectSource: (source: ActiveSource) => void;
}) {
  return (
    <div className="space-y-3 text-sm">
      <p className="font-medium leading-6 text-fg">{structured.summary}</p>

      {structured.keyPoints.length > 0 ? (
        <ul className="space-y-2 text-muted">
          {structured.keyPoints.map((point) => (
            <li key={point} className="flex gap-2.5 leading-5">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {structured.steps.length > 0 ? (
        <ol className="list-decimal space-y-1.5 pl-5 text-muted">
          {structured.steps.map((step) => (
            <li key={step} className="leading-5">
              {step}
            </li>
          ))}
        </ol>
      ) : null}

      {structured.snippets.length > 0 ? (
        <div className="space-y-2 pt-1">
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
    </div>
  );
}
