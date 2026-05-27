import Link from "next/link";
import { ArrowLeft, MessageSquareText, RefreshCw } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RepoPage({ params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    include: {
      files: { orderBy: { path: "asc" }, take: 40 },
      onboardingPaths: { orderBy: { createdAt: "desc" } },
      _count: { select: { files: true, chunks: true } },
    },
  });

  if (!repo) notFound();

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold text-slate-950">{repo.name}</h1>
              <a href={repo.url} className="mt-2 block truncate text-sm text-cyan-700 hover:underline">
                {repo.url}
              </a>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {repo.indexedAt ? "Indexed" : "Pending"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Branch: {repo.defaultBranch ?? "unknown"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/repos/${repo.id}/chat`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white transition hover:bg-cyan-800"
              >
                <MessageSquareText className="h-4 w-4" />
                Open chat
              </Link>
              <Link
                href={`/?reingest=${repo.id}`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Reindex
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Files indexed" value={repo._count.files} />
          <Metric label="Chunks stored" value={repo._count.chunks} />
          <Metric label="Onboarding paths" value={repo.onboardingPaths.length} />
        </div>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">Indexed files</h2>
            <p className="mt-1 text-sm text-slate-500">Showing the first 40 files stored for retrieval.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {repo.files.map((file) => (
              <div key={file.id} className="grid gap-2 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_160px]">
                <div className="truncate font-mono text-sm text-slate-800">{file.path}</div>
                <div className="text-sm text-slate-500">{file.language ?? "text"}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}
