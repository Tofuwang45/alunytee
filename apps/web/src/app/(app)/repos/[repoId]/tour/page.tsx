import { notFound } from "next/navigation";
import RepoTour from "@/components/repo/RepoTour";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RepoTourPage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  const repo = await prisma.repository.findUnique({ where: { id: repoId }, select: { id: true } });
  if (!repo) notFound();

  return <RepoTour repositoryId={repo.id} />;
}
