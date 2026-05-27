import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import RepoChat from "@/components/RepoChat";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RepoChatPage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    select: { id: true, name: true, url: true },
  });

  if (!repo) notFound();

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8">
        <Link
          href={`/repos/${repo.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to repo
        </Link>
        <header>
          <h1 className="text-2xl font-semibold text-slate-950">Chat with {repo.name}</h1>
          <p className="mt-2 text-sm text-slate-500">{repo.url}</p>
        </header>
        <RepoChat repositoryId={repo.id} />
      </div>
    </main>
  );
}
