"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ChatThread from "./ChatThread";
import ChatComposer from "./ChatComposer";
import SourcePanel from "./SourcePanel";
import {
  ActiveSource,
  ChatMessage,
  ChatResponse,
  createMessageId,
  dedupeReferences,
} from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import DepthSwitch from "@/components/ui/DepthSwitch";
import { useDepth } from "@/lib/hooks/useDepth";

const STARTER_QUESTIONS = [
  "What does this repo do?",
  "How do I run it locally?",
  "I'm interested in frontend — where should I start?",
];

const FOLLOW_UP_QUESTIONS = [
  "Show me the main entry point",
  "What tests exist?",
  "Explain the folder structure",
];

export default function ChatWorkspace({
  repositoryId,
  repoUrl,
  defaultBranch,
  initialQuestion,
}: {
  repositoryId: string;
  repoName?: string;
  repoUrl: string;
  defaultBranch: string | null;
  initialQuestion?: string;
}) {
  const [depth, setDepth] = useDepth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSource, setActiveSource] = useState<ActiveSource | null>(null);
  const [mobileTab, setMobileTab] = useState("chat");
  const [latestReferences, setLatestReferences] = useState<ChatResponse["references"]>([]);
  const [latestContext, setLatestContext] = useState<ChatResponse["context"]>([]);
  const [initialAsked, setInitialAsked] = useState(false);

  const handleSelectSource = useCallback((source: ActiveSource) => {
    setActiveSource(source);
    setMobileTab("sources");
  }, []);

  const askQuestion = useCallback(
    async (question: string) => {
      setError("");
      setIsLoading(true);
      setMessages((prev) => [...prev, { id: createMessageId(), role: "user", content: question }]);

      try {
        const result = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repositoryId, question, depth }),
        });
        const data = (await result.json()) as ChatResponse & { error?: string };

        if (!result.ok) throw new Error(data.error ?? "Unable to answer question.");

        const references = dedupeReferences(data.references);
        setLatestReferences(references);
        setLatestContext(data.context);

        if (references[0]) {
          setActiveSource({
            filePath: references[0].filePath,
            startLine: references[0].startLine,
            endLine: references[0].endLine,
          });
        }

        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            role: "assistant",
            content: data.answer,
            usedModel: data.usedModel,
            references,
            context: data.context,
          },
        ]);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to answer question.");
      } finally {
        setIsLoading(false);
      }
    },
    [repositoryId, depth],
  );

  useEffect(() => {
    if (initialQuestion && !initialAsked) {
      setInitialAsked(true);
      void askQuestion(initialQuestion);
    }
  }, [initialQuestion, initialAsked, askQuestion]);

  const suggestedQuestions = useMemo(
    () => (messages.length === 0 ? STARTER_QUESTIONS : FOLLOW_UP_QUESTIONS),
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
      onSelectSource={handleSelectSource}
    />
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-8.5rem)]">
      <div className="flex shrink-0 items-center justify-end px-4 pt-4 sm:px-6">
        <DepthSwitch value={depth} onChange={setDepth} />
      </div>

      {/* Mobile: tabbed layout */}
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <Tabs defaultValue="chat" value={mobileTab} onValueChange={setMobileTab} className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          <TabsList className="mb-3 shrink-0">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-default bg-surface">
              <ChatThread
                messages={messages}
                isLoading={isLoading}
                activeSource={activeSource}
                onSelectSource={handleSelectSource}
              />
              {error ? <p className="px-4 pb-2 text-sm text-danger">{error}</p> : null}
              <ChatComposer
                onSubmit={askQuestion}
                isLoading={isLoading}
                suggestedQuestions={suggestedQuestions}
              />
            </div>
          </TabsContent>
          <TabsContent value="sources" className="min-h-0 flex-1 overflow-hidden">
            {sourcePanel}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden min-h-0 flex-1 grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-4 px-6 pb-6 lg:grid">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-border-default bg-surface">
          <ChatThread
            messages={messages}
            isLoading={isLoading}
            activeSource={activeSource}
            onSelectSource={handleSelectSource}
          />
          {error ? <p className="px-4 pb-2 text-sm text-danger">{error}</p> : null}
          <ChatComposer
            onSubmit={askQuestion}
            isLoading={isLoading}
            suggestedQuestions={suggestedQuestions}
          />
        </div>
        {sourcePanel}
      </div>
    </div>
  );
}
