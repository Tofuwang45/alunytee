import { Suspense } from "react";
import { notFound } from "next/navigation";
import SessionChat from "@/components/chat/SessionChat";
import { isDepthLevel } from "@/lib/ai/depth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function SessionContent({
  sessionId,
  repositoryId,
  repoName,
  repoUrl,
  defaultBranch,
  depth,
  messages,
}: {
  sessionId: string;
  repositoryId: string;
  repoName: string;
  repoUrl: string;
  defaultBranch: string | null;
  depth: string;
  messages: {
    id: string;
    role: string;
    content: string;
    references: unknown;
    context: unknown;
    structured: unknown;
    lesson: unknown;
    usedModel: string | null;
  }[];
}) {
  return (
    <SessionChat
      sessionId={sessionId}
      repositoryId={repositoryId}
      repoName={repoName}
      repoUrl={repoUrl}
      defaultBranch={defaultBranch}
      initialDepth={depth}
      initialMessages={messages}
    />
  );
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      repository: {
        select: { id: true, name: true, url: true, defaultBranch: true },
      },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!session) notFound();

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading chat...</div>}>
      <SessionContent
        sessionId={session.id}
        repositoryId={session.repository.id}
        repoName={session.repository.name}
        repoUrl={session.repository.url}
        defaultBranch={session.repository.defaultBranch}
        depth={isDepthLevel(session.depth) ? session.depth : "plain"}
        messages={session.messages}
      />
    </Suspense>
  );
}
