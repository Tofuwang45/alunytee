"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  ChatResponse,
  FileReference,
  RetrievedChunk,
  dedupeReferences,
} from "./types";
import { DepthLevel, isDepthLevel } from "@/lib/ai/depth";
import { fetchJson } from "@/lib/utils/fetch-json";
import { cn } from "@/lib/utils/cn";

const FOLLOW_UP_QUESTIONS = [
  "Show me the main entry point",
  "What tests exist?",
  "Explain the folder structure",
];

type PersistedTurn = {
  id: string;
  role: string;
  content: string;
  references: unknown;
  context: unknown;
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
  seedQuestion,
}: {
  sessionId: string;
  repositoryId: string;
  repoName: string;
  repoUrl: string;
  defaultBranch: string | null;
  initialDepth: string;
  initialMessages: PersistedTurn[];
  seedQuestion?: string;
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
  const [seeded, setSeeded] = useState(false);

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
    async (question: string) => {
      setError("");
      setIsLoading(true);
      const tempUserId = `temp-${Date.now()}`;
      setMessages((prev) => [...prev, { id: tempUserId, role: "user", content: question }]);

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
          body: JSON.stringify({ sessionId, question }),
        });

        if (!ok || !data) throw new Error(error || "Unable to answer question.");

        const references = dedupeReferences(data.references);
        setLatestReferences(references);
        setLatestContext(data.context);

        if (references[0]) {
          setActiveSource({
            filePath: references[0].filePath,
            startLine: references[0].startLine,
            endLine: references[0].endLine,
          });
          setSourcesOpen(true);
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
    [sessionId],
  );

  useEffect(() => {
    if (seedQuestion && !seeded && messages.length === 0) {
      setSeeded(true);
      void askQuestion(seedQuestion);
    }
  }, [seedQuestion, seeded, messages.length, askQuestion]);

  const suggestedQuestions = useMemo(
    () => (messages.length === 0 ? [] : FOLLOW_UP_QUESTIONS),
    [messages.length],
  );

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
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border-default px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-fg">{repoName}</span>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setToolsOpen(!toolsOpen)}
              className="gap-1 text-muted"
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
                <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-md border border-border-default bg-surface py-1 shadow-lg">
                  <Link
                    href={`/repos/${repositoryId}/explore`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-surface-overlay"
                    onClick={() => setToolsOpen(false)}
                  >
                    <Layers className="h-4 w-4" />
                    Explore
                  </Link>
                  <Link
                    href={`/repos/${repositoryId}/tour`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-surface-overlay"
                    onClick={() => setToolsOpen(false)}
                  >
                    <Compass className="h-4 w-4" />
                    Guided tour
                  </Link>
                  <Link
                    href={`/repos/${repositoryId}/brief`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-surface-overlay"
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
            variant="outline"
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
            />
            {error ? <p className="pb-2 text-sm text-danger">{error}</p> : null}
            <ChatComposer
              onSubmit={askQuestion}
              isLoading={isLoading}
              suggestedQuestions={suggestedQuestions}
            />
          </div>
        </div>

        {sourcesOpen ? (
          <div
            className={cn(
              "absolute inset-y-0 right-0 z-20 flex w-full max-w-md flex-col border-l border-border-default bg-canvas shadow-xl sm:relative sm:shadow-none",
            )}
          >
            <div className="flex items-center justify-between border-b border-border-default px-3 py-2 sm:hidden">
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
