"use client";

import { FormEvent, useState } from "react";
import { Loader2, PlugZap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RepoIngestForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/repos/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json()) as { repositoryId?: string; error?: string };

      if (!response.ok || !data.repositoryId) {
        throw new Error(data.error ?? "Unable to ingest repository.");
      }

      router.push(`/repos/${data.repositoryId}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to ingest repository.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <label htmlFor="repo-url" className="block text-sm font-medium text-slate-700">
        Public GitHub repository URL
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id="repo-url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://github.com/vercel/next.js"
          className="min-h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
          {isLoading ? "Indexing..." : "Ingest Repo"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
