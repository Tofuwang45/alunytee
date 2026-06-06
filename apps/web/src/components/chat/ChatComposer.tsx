"use client";

import { FormEvent, RefObject, useState } from "react";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import SuggestedQuestions from "./SuggestedQuestions";
import { useSpeechToText } from "@/lib/hooks/useSpeechToText";
import { cn } from "@/lib/utils/cn";

export default function ChatComposer({
  onSubmit,
  isLoading,
  suggestedQuestions,
  inputRef,
  placeholder = "Ask about this codebase...",
}: {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  suggestedQuestions?: string[];
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  placeholder?: string;
}) {
  const [question, setQuestion] = useState("");

  const { start, stop, isRecording, error: micError } = useSpeechToText((text) => {
    setQuestion((prev) => (prev ? `${prev} ${text}` : text));
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setQuestion("");
  }

  function toggleMic() {
    if (isRecording) stop();
    else start();
  }

  return (
    <div className="px-4 pb-4 pt-2 sm:px-6">
      {suggestedQuestions?.length ? (
        <div className="mb-2">
          <SuggestedQuestions
            questions={suggestedQuestions}
            onSelect={(q) => {
              if (!isLoading) onSubmit(q);
            }}
            disabled={isLoading}
          />
        </div>
      ) : null}
      {micError ? <p className="mb-2 text-xs text-danger">{micError}</p> : null}
      {isRecording ? (
        <div
          className="mb-2 flex items-center gap-2.5 rounded-full border border-danger/40 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
          </span>
          <span>Listening… speak now</span>
          <span className="ml-0.5 flex items-end gap-0.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-0.5 animate-pulse rounded-full bg-danger"
                style={{ height: `${6 + (i % 2) * 6}px`, animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="glass-strong flex items-end gap-2 rounded-2xl p-2">
        <textarea
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={isRecording ? "Listening…" : placeholder}
          rows={2}
          className="min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-fg outline-none placeholder:text-muted"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
            }
          }}
        />
        <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={toggleMic}
            aria-pressed={isRecording}
            title={isRecording ? "Stop recording" : "Speak your question"}
            className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40",
              isRecording
                ? "border-danger/60 bg-danger/15 text-danger"
                : "border-glass-border bg-white/[0.04] text-muted hover:border-glass-highlight hover:bg-white/10 hover:text-fg",
            )}
          >
            {isRecording ? (
              <>
                <span className="absolute inset-0 animate-ping rounded-full border border-danger/50" />
                <MicOff className="relative h-4 w-4" />
              </>
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
          <Button
            type="submit"
            disabled={isLoading || !question.trim()}
            size="sm"
            className="h-9 min-w-[4.5rem] shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Ask</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
