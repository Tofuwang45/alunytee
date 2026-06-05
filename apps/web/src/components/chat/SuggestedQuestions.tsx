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
    <div className="flex flex-wrap gap-2">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(question)}
          className="glass-subtle rounded-full px-3 py-1.5 text-xs text-muted transition hover:bg-white/10 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
