import { notFound } from "next/navigation";
import RepoMap from "@/components/repo/RepoMap";
import RepoFileBrowser from "@/components/RepoFileBrowser";
import { prisma } from "@/lib/db";
import { getRepoInsights } from "@/lib/repo/insights";

export const dynamic = "force-dynamic";

export default async function RepoExplorePage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  const repo = await prisma.repository.findUnique({ where: { id: repoId }, select: { id: true } });
  if (!repo) notFound();

  const insights = await getRepoInsights(repo.id);

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6">
      <section>
        <h2 className="text-sm font-semibold text-fg">Concept map</h2>
        <p className="mb-3 text-xs text-muted">Click a file or area to explore it in chat.</p>
        <RepoMap repoId={repo.id} areas={insights.conceptMap} variant="full" />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-fg">All files</h2>
        <RepoFileBrowser repositoryId={repo.id} />
      </section>
    </div>
  );
}
