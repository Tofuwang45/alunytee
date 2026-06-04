"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, PlugZap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function RepoIngestForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const reingestId = searchParams.get("reingest");
    if (!reingestId) return;

    setIsLoading(true);
    fetch(`/api/repos/${reingestId}`)
      .then((res) => res.json())
      .then(async (data: { repo?: { url: string; id: string }; error?: string }) => {
        if (!data.repo?.url) throw new Error(data.error ?? "Repository not found.");
        setUrl(data.repo.url);
        const response = await fetch("/api/repos/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: data.repo.url }),
        });
        const result = (await response.json()) as { repositoryId?: string; error?: string };
        if (!response.ok || !result.repositoryId) {
          throw new Error(result.error ?? "Unable to reindex repository.");
        }
        setSuccess("Repository reindexed successfully.");
        router.replace(redirectTo ?? `/repos/${result.repositoryId}/explore`);
        router.refresh();
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Unable to reindex repository.");
      })
      .finally(() => setIsLoading(false));
  }, [searchParams, router, redirectTo]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
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

      router.push(redirectTo ?? `/repos/${data.repositoryId}/explore`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to ingest repository.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="repo-url" className="block text-sm font-medium text-fg">
            Public GitHub repository URL
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="repo-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://github.com/vercel/next.js"
              className="min-h-11 flex-1 rounded-md border border-border-default bg-canvas px-3 text-sm text-fg outline-none transition focus:border-accent"
              required
            />
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
              {isLoading ? "Indexing..." : "Ingest Repo"}
            </Button>
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {success ? <p className="text-sm text-[#3fb950]">{success}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
