"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";

type ChatResponse = {
  answer: string;
  usedModel: string;
  references: {
    filePath: string;
    startLine: number | null;
    endLine: number | null;
    score: number;
  }[];
  context: {
    id: string;
    filePath: string;
    content: string;
    startLine: number | null;
    endLine: number | null;
    score: number;
  }[];
};

export default function RepoChat({ repositoryId }: { repositoryId: string }) {
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositoryId, question }),
      });
      const data = (await result.json()) as ChatResponse & { error?: string };

      if (!result.ok) throw new Error(data.error ?? "Unable to answer question.");
      setResponse(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to answer question.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="question" className="block text-sm font-medium text-slate-700">
            Ask about this codebase
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Where is authentication handled?"
            className="min-h-32 w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Ask
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>

        {response ? (
          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
              Answer from {response.usedModel}
            </div>
            <div className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{response.answer}</div>
          </div>
        ) : (
          <div className="mt-6 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            Try questions like “What does this repo do?”, “How do I run it locally?”, or “What files
            should I read first?”
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">File References</h2>
          <div className="mt-3 space-y-2">
            {response?.references.length ? (
              response.references.map((reference) => (
                <div key={`${reference.filePath}-${reference.startLine}`} className="rounded-md bg-slate-50 p-3">
                  <div className="break-all font-mono text-xs text-slate-800">{reference.filePath}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {reference.startLine ? `Lines ${reference.startLine}-${reference.endLine}` : "Line range unavailable"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">References appear after the first answer.</p>
            )}
          </div>
        </div>

        <details className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">
            Retrieved Context
          </summary>
          <div className="mt-3 space-y-3">
            {response?.context.map((chunk) => (
              <pre
                key={chunk.id}
                className="max-h-64 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-100"
              >
                <code>{`${chunk.filePath}:${chunk.startLine ?? ""}\n\n${chunk.content}`}</code>
              </pre>
            ))}
          </div>
        </details>
      </aside>
    </div>
  );
}
