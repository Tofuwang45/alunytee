"use client";

import { useCallback, useRef, useState } from "react";
import { ChatMessage as ChatMessageType } from "./types";
import AnswerMarkdown from "./AnswerMarkdown";
import StructuredAnswerView from "./StructuredAnswer";
import LessonPlayer from "./LessonPlayer";
import { ActiveSource } from "./types";
import { structuredToSpeech } from "@/lib/ai/structured";
import { useTextToSpeech } from "@/lib/hooks/useTextToSpeech";
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
  onAskInStep,
}: {
  message: ChatMessageType;
  activeSource: ActiveSource | null;
  onSelectSource: (source: ActiveSource) => void;
  onAskInStep?: (stepFiles: string[]) => void;
}) {
  const isUser = message.role === "user";
  const { speak, stop, isSpeaking, speakingId } = useTextToSpeech();
  const messageIdRef = useRef(message.id);
  messageIdRef.current = message.id;
  const [stepSpeech, setStepSpeech] = useState("");

  const speechText =
    message.role === "assistant"
      ? message.lesson
        ? stepSpeech || message.lesson.intro
        : message.structured
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

  const handleStepSpeechChange = useCallback((text: string) => {
    setStepSpeech(text);
  }, []);

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "border border-sky-400/30 bg-gradient-to-br from-sky-400/90 to-indigo-500/90 text-white shadow-[0_0_14px_var(--accent-glow)] backdrop-blur-sm"
            : "glass text-muted",
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div className={cn("min-w-0 max-w-[88%]", isUser ? "text-right" : "text-left")}>
        <div
          className={cn(
            "inline-block max-w-full rounded-2xl px-4 py-3 text-left",
            isUser
              ? "border border-sky-400/25 bg-gradient-to-br from-sky-500/75 to-indigo-600/75 text-white shadow-[0_4px_24px_var(--accent-glow)] backdrop-blur-xl"
              : "glass-strong",
          )}
        >
          {isUser ? (
            <p className="text-sm leading-6">{message.content}</p>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-end gap-1 border-b border-glass-border pb-2">
                <button
                  type="button"
                  onClick={handleSpeak}
                  title={isSpeaking && speakingId === message.id ? "Stop" : "Listen"}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-muted transition hover:bg-white/10 hover:text-fg"
                >
                  {isSpeaking && speakingId === message.id ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                  Listen
                </button>
              </div>
              {message.lesson ? (
                <LessonPlayer
                  lesson={message.lesson}
                  activeSource={activeSource}
                  onSelectSource={onSelectSource}
                  onAskInStep={onAskInStep ?? (() => {})}
                  onStepSpeechChange={handleStepSpeechChange}
                />
              ) : message.structured ? (
                <StructuredAnswerView
                  structured={message.structured}
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
