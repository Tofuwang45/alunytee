"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import DepthSwitch from "@/components/ui/DepthSwitch";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDepth } from "@/lib/hooks/useDepth";

type BriefSection = { heading: string; body?: string; bullets?: string[] };
type Brief = { title: string; generatedAt: string; sections: BriefSection[]; markdown: string };

export default function OnboardingBrief({ repositoryId }: { repositoryId: string }) {
  const [depth, setDepth] = useDepth();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/repos/${repositoryId}/brief?depth=${depth}`);
      const data = (await res.json()) as { brief?: Brief; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to build brief.");
      setBrief(data.brief ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build brief.");
    } finally {
      setIsLoading(false);
    }
  }, [repositoryId, depth]);

  useEffect(() => {
    void load();
  }, [load]);

  async function copyMarkdown() {
    if (!brief) return;
    await navigator.clipboard.writeText(brief.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadMarkdown() {
    if (!brief) return;
    const blob = new Blob([brief.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "onboarding-brief.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">Onboarding brief</h1>
          <p className="mt-1 text-sm text-muted">A shareable summary generated from the codebase.</p>
        </div>
        <DepthSwitch value={depth} onChange={setDepth} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={copyMarkdown} disabled={!brief}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy Markdown
        </Button>
        <Button variant="outline" size="sm" onClick={downloadMarkdown} disabled={!brief}>
          <Download className="h-4 w-4" />
          Download .md
        </Button>
        <Button variant="ghost" size="sm" onClick={load} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Regenerate
        </Button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : brief ? (
        <Card>
          <CardContent className="space-y-6">
            <h2 className="text-lg font-semibold text-fg">{brief.title}</h2>
            {brief.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-sm font-semibold text-fg">{section.heading}</h3>
                {section.body ? (
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted">{section.body}</p>
                ) : null}
                {section.bullets?.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
