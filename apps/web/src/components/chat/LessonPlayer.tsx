"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { Lesson, LessonStep } from "@/lib/ai/structured";
import { highlightCode } from "@/lib/shiki/highlighter";
import AnswerMarkdown from "./AnswerMarkdown";
import CitationLink from "./CitationLink";
import { ActiveSource } from "./types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

function StepSnippet({
  snippet,
  activeSource,
  onSelectSource,
}: {
  snippet: NonNullable<LessonStep["snippet"]>;
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

export default function LessonPlayer({
  lesson,
  activeSource,
  onSelectSource,
  onAskInStep,
  onStepSpeechChange,
}: {
  lesson: Lesson;
  activeSource: ActiveSource | null;
  onSelectSource: (source: ActiveSource) => void;
  onAskInStep: (stepFiles: string[]) => void;
  onStepSpeechChange?: (text: string) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = lesson.steps[stepIndex];
  const total = lesson.steps.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;

  useEffect(() => {
    if (!step?.filePath) return;
    onSelectSource({
      filePath: step.filePath,
      startLine: step.startLine,
      endLine: step.endLine,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-open source when step index changes
  }, [stepIndex, step?.filePath, step?.startLine, step?.endLine]);

  useEffect(() => {
    if (!step || !onStepSpeechChange) return;
    const speech = [step.title, step.explanation, step.checkpoint].filter(Boolean).join(". ");
    onStepSpeechChange(speech);
  }, [step, onStepSpeechChange]);

  if (finished) {
    return (
      <div className="space-y-3 text-sm">
        <p className="font-medium text-fg">Walkthrough complete</p>
        <p className="leading-6 text-muted">
          You finished all {total} steps. Ask a follow-up question anytime, or start a new topic
          from the suggestions below.
        </p>
      </div>
    );
  }

  if (!step) return null;

  const stepFiles = [
    ...new Set([step.filePath, step.snippet?.filePath].filter(Boolean) as string[]),
  ];

  return (
    <div className="space-y-3 text-sm">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-sky-400/90">
          {lesson.title}
        </p>
        {stepIndex === 0 ? (
          <p className="text-xs leading-5 text-muted">{lesson.intro}</p>
        ) : null}
      </div>

      <div className="glass-subtle rounded-xl border border-glass-border p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-medium text-fg">{step.title}</h3>
          <span className="shrink-0 text-[11px] text-muted">
            Step {stepIndex + 1} of {total}
          </span>
        </div>

        <AnswerMarkdown
          content={step.explanation}
          activeSource={activeSource}
          onSelectSource={onSelectSource}
        />

        {step.filePath && !step.snippet ? (
          <button
            type="button"
            onClick={() =>
              onSelectSource({
                filePath: step.filePath!,
                startLine: step.startLine,
                endLine: step.endLine,
              })
            }
            className="mt-3"
          >
            <CitationLink
              filePath={step.filePath}
              startLine={step.startLine}
              endLine={step.endLine}
              activeSource={activeSource}
              onSelect={onSelectSource}
            />
          </button>
        ) : null}

        {step.snippet ? (
          <div className="mt-3">
            <StepSnippet
              snippet={step.snippet}
              activeSource={activeSource}
              onSelectSource={onSelectSource}
            />
          </div>
        ) : null}

        {step.checkpoint ? (
          <p className={cn("mt-3 rounded-lg border border-glass-border bg-white/[0.03] px-3 py-2 text-xs italic leading-5 text-muted")}>
            {step.checkpoint}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFirst}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          className="gap-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>

        {isLast ? (
          <Button type="button" size="sm" onClick={() => setFinished(true)} className="gap-1">
            Finish
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => setStepIndex((i) => Math.min(total - 1, i + 1))}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onAskInStep(stepFiles)}
          className="ml-auto gap-1.5 text-muted hover:text-fg"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          I have a question
        </Button>
      </div>
    </div>
  );
}
