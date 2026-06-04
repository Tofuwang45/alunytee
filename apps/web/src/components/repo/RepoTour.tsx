"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquareText } from "lucide-react";
import DepthSwitch from "@/components/ui/DepthSwitch";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDepth } from "@/lib/hooks/useDepth";

type TourStep = { id: string; title: string; body: string; files: string[] };
type Tour = { title: string; intro: string; steps: TourStep[] };

export default function RepoTour({ repositoryId }: { repositoryId: string }) {
  const [depth, setDepth] = useDepth();
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/repos/${repositoryId}/tour?depth=${depth}`);
      const data = (await res.json()) as { tour?: Tour; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load tour.");
      setTour(data.tour ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tour.");
    } finally {
      setIsLoading(false);
    }
  }, [repositoryId, depth]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">Guided tour</h1>
          {tour ? <p className="mt-1 text-sm text-muted">{tour.intro}</p> : null}
        </div>
        <DepthSwitch value={depth} onChange={setDepth} />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : tour ? (
        <ol className="relative space-y-4 border-l border-border-default pl-6">
          {tour.steps.map((step, index) => (
            <li key={step.id} className="relative">
              <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-border-default bg-canvas text-xs font-semibold text-fg">
                {index + 1}
              </span>
              <Card>
                <CardContent className="space-y-3">
                  <h2 className="text-sm font-semibold text-fg">{step.title}</h2>
                  <p className="whitespace-pre-line text-sm leading-6 text-muted">{step.body}</p>
                  {step.files.length ? (
                    <div className="flex flex-wrap gap-2">
                      {step.files.map((file) => (
                        <Link
                          key={file}
                          href="/"
                          className="inline-flex items-center gap-1 rounded-md border border-border-default bg-canvas px-2 py-1 font-mono text-xs text-accent-fg hover:border-accent"
                        >
                          <MessageSquareText className="h-3 w-3" />
                          {file}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      ) : null}

      {tour ? (
        <div className="flex flex-wrap gap-2">
          <Link href="/">
            <Button>
              <MessageSquareText className="h-4 w-4" />
              Ask a follow-up
            </Button>
          </Link>
          <Link href={`/repos/${repositoryId}/brief`}>
            <Button variant="outline">Generate onboarding brief</Button>
          </Link>
          <Button variant="ghost" onClick={load} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Regenerate
          </Button>
        </div>
      ) : null}
    </div>
  );
}
