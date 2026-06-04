"use client";

import { ChatMessage as ChatMessageType } from "./types";
import AnswerMarkdown from "./AnswerMarkdown";
import { ActiveSource } from "./types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { Bot, User } from "lucide-react";

export default function ChatMessage({
  message,
  activeSource,
  onSelectSource,
}: {
  message: ChatMessageType;
  activeSource: ActiveSource | null;
  onSelectSource: (source: ActiveSource) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-accent text-white" : "bg-surface-overlay text-muted",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("min-w-0 max-w-[85%]", isUser ? "text-right" : "text-left")}>
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-3 text-left",
            isUser ? "bg-accent text-white" : "border border-border-default bg-surface",
          )}
        >
          {isUser ? (
            <p className="text-sm leading-6">{message.content}</p>
          ) : (
            <>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="muted">{message.usedModel}</Badge>
                {message.references.length > 0 ? (
                  <Badge variant="primary">{message.references.length} sources</Badge>
                ) : null}
              </div>
              <AnswerMarkdown
                content={message.content}
                activeSource={activeSource}
                onSelectSource={onSelectSource}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
