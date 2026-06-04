import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Github, MessageSquareText, TerminalSquare } from "lucide-react";
import RepoIngestForm from "@/components/RepoIngestForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type IndexedRepository = {
  id: string;
  name: string;
  url: string;
  indexedAt: Date | null;
  _count: { files: number; chunks: number };
};

function formatRelative(date: Date | null) {
  if (!date) return "Not indexed";
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Indexed today";
  if (days === 1) return "Indexed yesterday";
  return `Indexed ${days} days ago`;
}

export default async function Home() {
  const [repos, fileAgg, chunkAgg] = await Promise.all([
    prisma.repository.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { files: true, chunks: true } } },
    }),
    prisma.repoFile.count(),
    prisma.repoChunk.count(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Dashboard"
        subtitle="Index public GitHub repositories and onboard developers with cited, interactive codebase exploration."
        actions={
          <Link href="/progress">
            <Button variant="outline">Progress</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Repositories" value={repos.length} />
        <StatCard label="Files indexed" value={fileAgg} />
        <StatCard label="Chunks stored" value={chunkAgg} />
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted">Loading form...</p>
            </CardContent>
          </Card>
        }
      >
        <RepoIngestForm />
      </Suspense>

      <Card>
        <CardContent className="grid gap-4 pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <TerminalSquare className="h-4 w-4" />
              Local LangGraph CLI
            </div>
            <h2 className="mt-2 text-base font-semibold text-fg">Secure local codebase agent</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Run from{" "}
              <code className="rounded border border-border-default bg-canvas px-1.5 py-0.5 font-mono text-xs">
                packages/mcp-ts-repo-builder
              </code>{" "}
              with sanitized tool output.
            </p>
          </div>
          <Link href="/local-agent">
            <Button variant="outline">CLI workflow</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-fg">Your repositories</h2>
            <p className="mt-1 text-xs text-muted">Recent activity across indexed repos</p>
          </div>
          <Github className="h-5 w-5 text-muted" />
        </CardHeader>
        {repos.length ? (
          <div className="divide-y divide-border-muted">
            {(repos as IndexedRepository[]).map((repo) => (
              <div
                key={repo.id}
                className="grid gap-3 px-4 py-3 transition hover:bg-surface-overlay sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <Link href={`/repos/${repo.id}`} className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-accent-fg hover:underline">{repo.name}</h3>
                    <Badge variant={repo.indexedAt ? "success" : "muted"}>
                      {repo.indexedAt ? "Indexed" : "Pending"}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">{repo.url}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                    <span>{repo._count.files} files</span>
                    <span>{repo._count.chunks} chunks</span>
                    <span>{formatRelative(repo.indexedAt)}</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link href={`/repos/${repo.id}/chat`}>
                    <Button variant="outline" size="sm">
                      <MessageSquareText className="h-4 w-4" />
                      Chat
                    </Button>
                  </Link>
                  <Link href={`/repos/${repo.id}`}>
                    <Button variant="ghost" size="sm">
                      Open <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CardContent className="py-12 text-center">
            <MessageSquareText className="mx-auto h-8 w-8 text-border-default" />
            <p className="mt-3 text-sm text-muted">No repositories indexed yet.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-2xl font-semibold text-fg">{value.toLocaleString()}</div>
        <div className="mt-1 text-xs text-muted">{label}</div>
      </CardContent>
    </Card>
  );
}
