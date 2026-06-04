"use client";

import { useCallback, useRef } from "react";
import { ChatMessage as ChatMessageType } from "./types";
import AnswerMarkdown from "./AnswerMarkdown";
import StructuredAnswerView from "./StructuredAnswer";
import { ActiveSource } from "./types";
import { structuredToSpeech } from "@/lib/ai/structured";
import { useTextToSpeech } from "@/lib/hooks/useTextToSpeech";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { Bot, User, Volume2, VolumeX } from "lucide-react";

function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

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
  const { speak, stop, isSpeaking, speakingId } = useTextToSpeech();
  const messageIdRef = useRef(message.id);
  messageIdRef.current = message.id;

  const speechText =
    message.role === "assistant"
      ? message.structured
        ? structuredToSpeech(message.structured)
        : stripMarkdownForSpeech(message.content)
      : message.content;

  const handleSpeak = useCallback(() => {
    if (isSpeaking && speakingId === message.id) {
      stop();
      return;
    }
    void speak(speechText, message.id);
  }, [isSpeaking, speakingId, message.id, speechText, speak, stop]);

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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs text-muted"
                  onClick={handleSpeak}
                  title={isSpeaking && speakingId === message.id ? "Stop" : "Listen"}
                >
                  {isSpeaking && speakingId === message.id ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                  Listen
                </Button>
              </div>
              {message.structured ? (
                <StructuredAnswerView
                  structured={message.structured}
                  references={message.references}
                  activeSource={activeSource}
                  onSelectSource={onSelectSource}
                />
              ) : (
                <AnswerMarkdown
                  content={message.content}
                  activeSource={activeSource}
                  onSelectSource={onSelectSource}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
