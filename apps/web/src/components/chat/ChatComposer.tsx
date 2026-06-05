"use client";

import { FormEvent, useState } from "react";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import SuggestedQuestions from "./SuggestedQuestions";
import { useSpeechToText } from "@/lib/hooks/useSpeechToText";
import { cn } from "@/lib/utils/cn";

export default function ChatComposer({
  onSubmit,
  isLoading,
  suggestedQuestions,
}: {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  suggestedQuestions?: string[];
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
        <SuggestedQuestions
          questions={suggestedQuestions}
          onSelect={(q) => {
            if (!isLoading) onSubmit(q);
          }}
          disabled={isLoading}
        />
      ) : null}
      {micError ? <p className="mb-2 text-xs text-danger">{micError}</p> : null}
      <form onSubmit={handleSubmit} className="glass-strong flex items-end gap-2 rounded-2xl p-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this codebase..."
          rows={2}
          className="min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-fg outline-none placeholder:text-muted"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={toggleMic}
          className={cn(
            "h-10 w-10 shrink-0 rounded-full p-0",
            isRecording && "border-danger text-danger shadow-[0_0_12px_rgba(248,113,113,0.4)]",
          )}
          title={isRecording ? "Stop recording" : "Speak your question"}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !question.trim()}
          size="sm"
          className="h-10 w-10 shrink-0 rounded-full p-0 sm:w-auto sm:px-4"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="hidden sm:inline">Ask</span>
        </Button>
      </form>
    </div>
  );
}
