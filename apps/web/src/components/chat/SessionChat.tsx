"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Compass,
  FileText,
  Layers,
  PanelRightClose,
  PanelRightOpen,
  X,
} from "lucide-react";
import ChatThread from "./ChatThread";
import ChatComposer from "./ChatComposer";
import SourcePanel from "./SourcePanel";
import DepthSwitch from "@/components/ui/DepthSwitch";
import { Button } from "@/components/ui/Button";
import {
  ActiveSource,
  ChatMessage,
  ChatMode,
  ChatResponse,
  FileReference,
  RetrievedChunk,
  dedupeReferences,
} from "./types";
import { DepthLevel, isDepthLevel } from "@/lib/ai/depth";
import { parseLesson, parseStructuredAnswer } from "@/lib/ai/structured";
import { fetchJson } from "@/lib/utils/fetch-json";
import { cn } from "@/lib/utils/cn";

const TEACHING_QUESTIONS = [
  "Explain that step more simply",
  "Walk me through the next area",
  "Start a guided walkthrough",
];

const GENERAL_QUESTIONS = [
  "What does this project do?",
  "How do I run it locally?",
  "Explain the folder structure",
];

type AskOptions = {
  mode?: ChatMode;
  stepFiles?: string[];
};

type PersistedTurn = {
  id: string;
  role: string;
  content: string;
  references: unknown;
  context: unknown;
  structured: unknown;
  lesson: unknown;
  usedModel: string | null;
};

function toChatMessages(turns: PersistedTurn[]): ChatMessage[] {
  return turns.map((t) => {
    if (t.role === "user") {
      return { id: t.id, role: "user" as const, content: t.content };
    }
    return {
      id: t.id,
      role: "assistant" as const,
      content: t.content,
      usedModel: t.usedModel ?? "fallback",
      structured: parseStructuredAnswer(t.structured),
      lesson: parseLesson(t.lesson),
      references: (t.references as FileReference[]) ?? [],
      context: (t.context as RetrievedChunk[]) ?? [],
    };
  });
}

export default function SessionChat({
  sessionId,
  repositoryId,
  repoName,
  repoUrl,
  defaultBranch,
  initialDepth,
  initialMessages,
}: {
  sessionId: string;
  repositoryId: string;
  repoName: string;
  repoUrl: string;
  defaultBranch: string | null;
  initialDepth: string;
  initialMessages: PersistedTurn[];
}) {
  const [depth, setDepth] = useState<DepthLevel>(
    isDepthLevel(initialDepth) ? initialDepth : "plain",
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => toChatMessages(initialMessages));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSource, setActiveSource] = useState<ActiveSource | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [latestReferences, setLatestReferences] = useState<FileReference[]>([]);
  const [latestContext, setLatestContext] = useState<RetrievedChunk[]>([]);
  const [lessonStepFiles, setLessonStepFiles] = useState<string[]>([]);
  const [serverFollowUps, setServerFollowUps] = useState<string[]>([]);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const hasActiveLesson = useMemo(
    () => messages.some((m) => m.role === "assistant" && m.lesson),
    [messages],
  );

  const handleDepthChange = useCallback(
    (next: DepthLevel) => {
      setDepth(next);
      void fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depth: next }),
      });
    },
    [sessionId],
  );

  const askQuestion = useCallback(
    async (question: string, opts?: AskOptions) => {
      setError("");
      setIsLoading(true);
      const tempUserId = `temp-${Date.now()}`;
      setMessages((prev) => [...prev, { id: tempUserId, role: "user", content: question }]);

      const isWalkthrough =
        opts?.mode === "lesson" || question === "Start a guided walkthrough";
      const mode: ChatMode = isWalkthrough ? "lesson" : "answer";
      const stepFiles =
        opts?.stepFiles ?? (mode === "answer" && lessonStepFiles.length ? lessonStepFiles : undefined);

      try {
        const { ok, data, error } = await fetchJson<
          ChatResponse & {
            error?: string;
            userMessageId?: string;
            assistantMessageId?: string;
          }
        >("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, question, mode, stepFiles }),
        });

        if (!ok || !data) throw new Error(error || "Unable to answer question.");

        const references = dedupeReferences(data.references);
        setLatestReferences(references);
        setLatestContext(data.context);
        setServerFollowUps(data.followUps ?? []);

        const firstRef =
          data.lesson?.steps[0]?.filePath != null
            ? {
                filePath: data.lesson.steps[0].filePath!,
                startLine: data.lesson.steps[0].startLine,
                endLine: data.lesson.steps[0].endLine,
              }
            : references[0]
              ? {
                  filePath: references[0].filePath,
                  startLine: references[0].startLine,
                  endLine: references[0].endLine,
                }
              : null;

        if (firstRef) {
          setActiveSource(firstRef);
          setSourcesOpen(true);
        }

        if (mode === "answer" && stepFiles?.length) {
          setLessonStepFiles([]);
        }

        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempUserId);
          return [
            ...withoutTemp,
            {
              id: data.userMessageId ?? tempUserId,
              role: "user",
              content: question,
            },
            {
              id: data.assistantMessageId ?? `temp-a-${Date.now()}`,
              role: "assistant",
              content: data.answer,
              usedModel: data.usedModel,
              structured: data.structured ?? null,
              lesson: data.lesson ?? null,
              references,
              context: data.context,
            },
          ];
        });
      } catch (caught) {
        setMessages((prev) => prev.filter((m) => m.id !== tempUserId));
        setError(caught instanceof Error ? caught.message : "Unable to answer question.");
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, lessonStepFiles],
  );

  const handleAskInStep = useCallback((stepFiles: string[]) => {
    setLessonStepFiles(stepFiles);
    composerRef.current?.focus();
  }, []);

  const suggestedQuestions = useMemo(() => {
    if (messages.length === 0) {
      return ["Start a guided walkthrough", ...GENERAL_QUESTIONS.slice(0, 2)];
    }
    if (serverFollowUps.length) return serverFollowUps;
    return hasActiveLesson ? TEACHING_QUESTIONS : GENERAL_QUESTIONS;
  }, [messages.length, hasActiveLesson, serverFollowUps]);

  const composerPlaceholder =
    lessonStepFiles.length > 0
      ? "Ask about this step..."
      : hasActiveLesson
        ? "Ask a follow-up or continue the walkthrough..."
        : "Ask about this codebase...";

  const sourcePanel = (
    <SourcePanel
      repositoryId={repositoryId}
      repoUrl={repoUrl}
      defaultBranch={defaultBranch}
      references={latestReferences}
      context={latestContext}
      activeSource={activeSource}
      onSelectSource={(source) => {
        setActiveSource(source);
        setSourcesOpen(true);
      }}
    />
  );

  return (
    <div className="flex h-full flex-col">
      <header className="glass mx-3 mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-heading text-sm font-medium text-fg">{repoName}</span>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setToolsOpen(!toolsOpen)}
              className="gap-1"
            >
              Tools
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            {toolsOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  aria-label="Close tools"
                  onClick={() => setToolsOpen(false)}
                />
                <div className="glass-strong absolute left-0 top-full z-20 mt-1 w-48 overflow-hidden py-1">
                  <Link
                    href={`/repos/${repositoryId}/explore`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-white/10"
                    onClick={() => setToolsOpen(false)}
                  >
                    <Layers className="h-4 w-4" />
                    Explore
                  </Link>
                  <Link
                    href={`/repos/${repositoryId}/tour`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-white/10"
                    onClick={() => setToolsOpen(false)}
                  >
                    <Compass className="h-4 w-4" />
                    Guided tour
                  </Link>
                  <Link
                    href={`/repos/${repositoryId}/brief`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-white/10"
                    onClick={() => setToolsOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Onboarding brief
                  </Link>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DepthSwitch value={depth} onChange={handleDepthChange} />
          <Button
            variant={sourcesOpen ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSourcesOpen(!sourcesOpen)}
            className="hidden sm:inline-flex"
          >
            {sourcesOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
            Sources
          </Button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <div className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col px-4 pb-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ChatThread
              messages={messages}
              isLoading={isLoading}
              activeSource={activeSource}
              onSelectSource={(source) => {
                setActiveSource(source);
                setSourcesOpen(true);
              }}
              onAskInStep={handleAskInStep}
            />
            {error ? <p className="pb-2 text-sm text-danger">{error}</p> : null}
            <ChatComposer
              onSubmit={askQuestion}
              isLoading={isLoading}
              suggestedQuestions={suggestedQuestions}
              inputRef={composerRef}
              placeholder={composerPlaceholder}
            />
          </div>
        </div>

        {sourcesOpen ? (
          <div
            className={cn(
              "glass-strong absolute inset-y-0 right-0 z-20 m-3 flex w-full max-w-md flex-col overflow-hidden rounded-2xl sm:relative",
            )}
          >
            <div className="flex items-center justify-between border-b border-glass-border px-3 py-2 sm:hidden">
              <span className="text-sm font-medium text-fg">Sources</span>
              <button
                type="button"
                onClick={() => setSourcesOpen(false)}
                className="rounded p-1 text-muted hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">{sourcePanel}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
