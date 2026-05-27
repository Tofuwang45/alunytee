import Link from "next/link";
import { ArrowRight, Database, Github, MessageSquareText, TerminalSquare } from "lucide-react";
import RepoIngestForm from "@/components/RepoIngestForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type IndexedRepository = {
  id: string;
  name: string;
  url: string;
  indexedAt: Date | null;
  _count: {
    files: number;
    chunks: number;
  };
};

export default async function Home() {
  const repos: IndexedRepository[] = await prisma.repository.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { files: true, chunks: true } } },
  });

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800">
              <Database className="h-3.5 w-3.5" />
              Local-first MVP
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Alunyte Onboarding Agent
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Index a public GitHub repository, search its code, and ask onboarding questions with
              source file references.
            </p>
          </div>
          <Link
            href="/progress"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Progress dashboard
          </Link>
        </header>

        <RepoIngestForm />

        <section className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-800">
                <TerminalSquare className="h-4 w-4" />
                Local LangGraph CLI
              </div>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">Secure codebase onboarding agent</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                The synced local agent runs from <code className="font-mono">packages/mcp-ts-repo-builder</code> and
                uses a strict LangGraph loop with sanitized tool output before code reaches agent memory.
              </p>
            </div>
            <Link
              href="/local-agent"
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              View CLI workflow
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Indexed repositories</h2>
              <p className="mt-1 text-sm text-slate-500">Open a repo to inspect indexing results or chat.</p>
            </div>
            <Github className="h-5 w-5 text-slate-400" />
          </div>

          {repos.length ? (
            <div className="divide-y divide-slate-200">
              {repos.map((repo) => (
                <Link
                  key={repo.id}
                  href={`/repos/${repo.id}`}
                  className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium text-slate-950">{repo.name}</h3>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {repo.indexedAt ? "Indexed" : "Pending"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">{repo.url}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{repo._count.files} files</span>
                    <span>{repo._count.chunks} chunks</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <MessageSquareText className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No repositories indexed yet.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
