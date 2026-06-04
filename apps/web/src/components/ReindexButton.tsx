"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function ReindexButton({ repoUrl }: { repoUrl: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function reindex() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/repos/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl }),
      });
      const data = (await response.json()) as { repositoryId?: string; error?: string };
      if (!response.ok || !data.repositoryId) {
        throw new Error(data.error ?? "Unable to reindex repository.");
      }
      router.push(`/repos/${data.repositoryId}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to reindex.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Button variant="outline" onClick={reindex} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Reindex
      </Button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
