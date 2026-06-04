import Link from "next/link";
import { notFound } from "next/navigation";
import ReindexButton from "@/components/ReindexButton";
import RepoTabs from "@/components/repo/RepoTabs";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/db";

export default async function RepoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    select: { id: true, name: true, url: true, defaultBranch: true, indexedAt: true },
  });

  if (!repo) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col">
      <div className="border-b border-border-default px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-fg">
                <Link href={repo.url} className="hover:text-accent-fg" target="_blank" rel="noopener noreferrer">
                  {repo.name}
                </Link>
              </h1>
              <Badge variant={repo.indexedAt ? "success" : "muted"}>
                {repo.indexedAt ? "Indexed" : "Pending"}
              </Badge>
              <Badge variant="default">{repo.defaultBranch ?? "main"}</Badge>
            </div>
            <p className="mt-1 truncate text-sm text-muted">{repo.url}</p>
          </div>
          <ReindexButton repoUrl={repo.url} />
        </div>
      </div>
      <RepoTabs repoId={repo.id} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
