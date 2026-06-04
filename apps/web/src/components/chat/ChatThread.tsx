"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { ActiveSource, ChatMessage as ChatMessageType } from "./types";

export default function ChatThread({
  messages,
  isLoading,
  activeSource,
  onSelectSource,
}: {
  messages: ChatMessageType[];
  isLoading: boolean;
  activeSource: ActiveSource | null;
  onSelectSource: (source: ActiveSource) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!messages.length && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-fg">Ask about this codebase</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Get guided answers with clickable file references. Try questions about architecture,
            setup, or where to start as a frontend developer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-6">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          activeSource={activeSource}
          onSelectSource={onSelectSource}
        />
      ))}
      {isLoading ? (
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ) : null}
      <div ref={bottomRef} />
    </div>
  );
}
