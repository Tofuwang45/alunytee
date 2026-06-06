"use client";

export default function SuggestedQuestions({
  questions,
  onSelect,
  disabled,
}: {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {questions.slice(0, 3).map((question) => (
        <button
          key={question}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className="glass-subtle max-w-full truncate rounded-full px-3 py-1 text-[11px] text-muted transition hover:bg-white/8 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
          title={question}
        >
          {question}
        </button>
      ))}
    </div>
  );
}
