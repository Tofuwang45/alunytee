"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { highlightCode } from "@/lib/shiki/highlighter";
import CitationLink from "./CitationLink";
import { ActiveSource } from "./types";

const CITATION_PATTERN =
  /(`([^`]+)`)|(\b[\w./-]+\.(tsx?|jsx?|py|md|json|yaml|yml|css|html|sql|rs|go|java|toml|sh)(?::(\d+)(?:-(\d+))?)?(?:#L(\d+)(?:-L(\d+))?)?)/g;

function parseCitation(text: string): ActiveSource | null {
  const pathMatch = text.match(/^([\w./-]+\.\w+)(?::(\d+)(?:-(\d+))?)?(?:#L(\d+)(?:-L(\d+))?)?$/);
  if (!pathMatch) return null;
  const filePath = pathMatch[1];
  const startLine = pathMatch[2] ? Number(pathMatch[2]) : pathMatch[4] ? Number(pathMatch[4]) : null;
  const endLine = pathMatch[3] ? Number(pathMatch[3]) : pathMatch[5] ? Number(pathMatch[5]) : startLine;
  return { filePath, startLine, endLine };
}

function renderTextWithCitations(
  text: string,
  activeSource: ActiveSource | null,
  onSelect: (source: ActiveSource) => void,
) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(CITATION_PATTERN.source, "g");
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const raw = match[2] ?? match[3];
    const citation = parseCitation(raw);
    if (citation) {
      parts.push(
        <CitationLink
          key={`${match.index}-${raw}`}
          filePath={citation.filePath}
          startLine={citation.startLine}
          endLine={citation.endLine}
          activeSource={activeSource}
          onSelect={onSelect}
        />,
      );
    } else {
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : text;
}

function MarkdownCodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [html, setHtml] = useState("");
  const lang = className?.replace("language-", "") ?? "text";
  const code = String(children ?? "").replace(/\n$/, "");

  useEffect(() => {
    highlightCode(code, lang).then(setHtml);
  }, [code, lang]);

  if (!html) {
    return (
      <pre className="overflow-x-auto rounded-md border border-border-default bg-code-bg p-3">
        <code className="text-xs leading-5 text-fg">{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-md border border-border-default bg-code-bg p-3 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!text-xs [&_code]:!leading-5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function AnswerMarkdown({
  content,
  activeSource,
  onSelectSource,
}: {
  content: string;
  activeSource: ActiveSource | null;
  onSelectSource: (source: ActiveSource) => void;
}) {
  return (
    <div className="markdown-answer space-y-2 text-sm text-fg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p>
              {typeof children === "string"
                ? renderTextWithCitations(children, activeSource, onSelectSource)
                : children}
            </p>
          ),
          li: ({ children }) => (
            <li>
              {typeof children === "string"
                ? renderTextWithCitations(children, activeSource, onSelectSource)
                : children}
            </li>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.startsWith("language-");
            if (isBlock) {
              return <MarkdownCodeBlock className={className}>{children}</MarkdownCodeBlock>;
            }
            const text = String(children);
            const citation = parseCitation(text);
            if (citation) {
              return (
                <CitationLink
                  filePath={citation.filePath}
                  startLine={citation.startLine}
                  endLine={citation.endLine}
                  activeSource={activeSource}
                  onSelect={onSelectSource}
                />
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
