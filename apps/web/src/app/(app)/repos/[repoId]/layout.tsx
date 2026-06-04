import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import ReindexButton from "@/components/ReindexButton";
import { Button } from "@/components/ui/Button";
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
    select: { id: true, name: true, url: true },
  });

  if (!repo) notFound();

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-default px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-fg">{repo.name}</h1>
          <p className="truncate text-xs text-muted">{repo.url}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <nav className="hidden items-center gap-3 text-xs sm:flex">
            <Link href={`/repos/${repo.id}/explore`} className="text-muted hover:text-accent-fg">
              Explore
            </Link>
            <Link href={`/repos/${repo.id}/tour`} className="text-muted hover:text-accent-fg">
              Tour
            </Link>
            <Link href={`/repos/${repo.id}/brief`} className="text-muted hover:text-accent-fg">
              Brief
            </Link>
          </nav>
          <Link href="/">
            <Button size="sm">
              <MessageSquarePlus className="h-4 w-4" />
              New chat
            </Button>
          </Link>
          <ReindexButton repoUrl={repo.url} />
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
