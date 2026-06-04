import { Suspense } from "react";
import { notFound } from "next/navigation";
import ChatWorkspace from "@/components/chat/ChatWorkspace";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function ChatContent({
  repositoryId,
  repoName,
  repoUrl,
  defaultBranch,
  initialQuestion,
}: {
  repositoryId: string;
  repoName: string;
  repoUrl: string;
  defaultBranch: string | null;
  initialQuestion?: string;
}) {
  return (
    <ChatWorkspace
      repositoryId={repositoryId}
      repoName={repoName}
      repoUrl={repoUrl}
      defaultBranch={defaultBranch}
      initialQuestion={initialQuestion}
    />
  );
}

export default async function RepoChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ repoId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { repoId } = await params;
  const { q } = await searchParams;
  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    select: { id: true, name: true, url: true, defaultBranch: true },
  });

  if (!repo) notFound();

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading chat...</div>}>
      <ChatContent
        repositoryId={repo.id}
        repoName={repo.name}
        repoUrl={repo.url}
        defaultBranch={repo.defaultBranch}
        initialQuestion={q}
      />
    </Suspense>
  );
}
