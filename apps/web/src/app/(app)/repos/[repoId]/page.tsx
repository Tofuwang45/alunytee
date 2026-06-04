import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { notFound } from "next/navigation";
import MissionLauncher from "@/components/repo/MissionLauncher";
import RepoMap from "@/components/repo/RepoMap";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { prisma } from "@/lib/db";
import { getRepoInsights } from "@/lib/repo/insights";

export const dynamic = "force-dynamic";

export default async function RepoHomePage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    select: { id: true, indexedAt: true },
  });
  if (!repo) notFound();

  const insights = await getRepoInsights(repo.id);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <MissionLauncher repoId={repo.id} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-fg">In plain English</h2>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm leading-6 text-fg">{insights.summary}</p>
            <Link href={`/repos/${repo.id}/tour`} className="mt-4 inline-block">
              <Button>
                <Compass className="h-4 w-4" />
                Take the guided tour
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-fg">Suggested next step</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>
              {repo.indexedAt
                ? "This repo is indexed and ready. Start with the guided tour, then dive into the areas that matter to you."
                : "This repo is still indexing. Some answers may be incomplete."}
            </p>
            <Link href={`/repos/${repo.id}/brief`}>
              <Button variant="outline" size="sm">
                Generate onboarding brief
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-fg">Repo map</h2>
            <p className="text-xs text-muted">The codebase grouped into concepts, not just files.</p>
          </div>
          <Link href={`/repos/${repo.id}/explore`} className="text-xs text-accent-fg hover:underline">
            Explore all
          </Link>
        </div>
        <RepoMap repoId={repo.id} areas={insights.conceptMap} variant="preview" />
      </div>
    </div>
  );
}
