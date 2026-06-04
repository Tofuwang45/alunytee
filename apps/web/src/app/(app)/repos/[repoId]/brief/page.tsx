import { notFound } from "next/navigation";
import OnboardingBrief from "@/components/repo/OnboardingBrief";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RepoBriefPage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  const repo = await prisma.repository.findUnique({ where: { id: repoId }, select: { id: true } });
  if (!repo) notFound();

  return <OnboardingBrief repositoryId={repo.id} />;
}
