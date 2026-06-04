"use client";

import { useEffect, useMemo, useState } from "react";
import { FileCode2, MessageSquareText, Search } from "lucide-react";
import Link from "next/link";
import CodeViewer from "@/components/chat/CodeViewer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ActiveSource } from "@/components/chat/types";

type FileEntry = { path: string; language: string | null };

export default function RepoFileBrowser({ repositoryId }: { repositoryId: string }) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<ActiveSource | null>(null);
  const [fileContent, setFileContent] = useState<{
    path: string;
    language: string | null;
    content: string;
    githubUrl: string;
  } | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  useEffect(() => {
    fetch(`/api/repos/${repositoryId}/files?list=true`)
      .then((res) => res.json())
      .then((data: { files: FileEntry[] }) => setFiles(data.files ?? []))
      .finally(() => setIsLoading(false));
  }, [repositoryId]);

  useEffect(() => {
    if (!activeSource) {
      setFileContent(null);
      return;
    }

    let cancelled = false;
    setIsLoadingFile(true);
    fetch(`/api/repos/${repositoryId}/files?path=${encodeURIComponent(activeSource.filePath)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setFileContent(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingFile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSource, repositoryId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.path.toLowerCase().includes(q));
  }, [files, query]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-fg">Indexed files</h2>
          <p className="mt-1 text-xs text-muted">{files.length} files stored for retrieval</p>
          <div className="relative mt-3">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by path..."
              className="w-full rounded-md border border-border-default bg-canvas py-2 pr-3 pl-9 text-sm text-fg outline-none focus:border-accent"
            />
          </div>
        </CardHeader>
        <CardContent className="max-h-[480px] overflow-y-auto p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="divide-y divide-border-muted">
              {filtered.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-overlay"
                >
                  <button
                    type="button"
                    onClick={() => setActiveSource({ filePath: file.path, startLine: null, endLine: null })}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <FileCode2 className="h-4 w-4 shrink-0 text-muted" />
                    <span className="truncate font-mono text-sm text-fg">{file.path}</span>
                  </button>
                  <Badge variant="muted">{file.language ?? "text"}</Badge>
                  <Link href="/">
                    <Button variant="ghost" size="sm">
                      <MessageSquareText className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
              {!filtered.length ? (
                <p className="px-4 py-8 text-center text-sm text-muted">No files match your search.</p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        {!activeSource ? (
          <CardContent className="flex h-[480px] flex-col items-center justify-center text-center text-sm text-muted">
            <FileCode2 className="mb-2 h-10 w-10 text-border-default" />
            Select a file to preview its contents
          </CardContent>
        ) : isLoadingFile ? (
          <CardContent className="space-y-2 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        ) : fileContent ? (
          <CodeViewer
            content={fileContent.content}
            language={fileContent.language}
            filePath={fileContent.path}
            githubUrl={fileContent.githubUrl}
            className="h-[480px]"
          />
        ) : null}
      </Card>
    </div>
  );
}
