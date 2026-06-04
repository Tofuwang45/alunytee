"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileCode2 } from "lucide-react";
import CodeViewer from "./CodeViewer";
import { FileReferenceList } from "./CitationLink";
import { ActiveSource, FileReference, RetrievedChunk } from "./types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { buildGitHubFileUrl } from "@/lib/repo/github-links";

type FileContent = {
  path: string;
  language: string | null;
  content: string;
  githubUrl: string;
};

export default function SourcePanel({
  repositoryId,
  repoUrl,
  defaultBranch,
  references,
  context,
  activeSource,
  onSelectSource,
}: {
  repositoryId: string;
  repoUrl: string;
  defaultBranch: string | null;
  references: FileReference[];
  context: RetrievedChunk[];
  activeSource: ActiveSource | null;
  onSelectSource: (source: ActiveSource) => void;
}) {
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (!activeSource) {
      setFileContent(null);
      return;
    }

    let cancelled = false;
    setIsLoadingFile(true);
    setFileError("");

    const params = new URLSearchParams({ path: activeSource.filePath });
    if (activeSource.startLine != null) params.set("startLine", String(activeSource.startLine));
    if (activeSource.endLine != null) params.set("endLine", String(activeSource.endLine));

    fetch(`/api/repos/${repositoryId}/files?${params}`)
      .then((res) => res.json())
      .then((data: FileContent & { error?: string }) => {
        if (cancelled) return;
        if (data.error) {
          setFileError(data.error);
          setFileContent(null);
        } else {
          setFileContent(data);
        }
      })
      .catch(() => {
        if (!cancelled) setFileError("Failed to load file.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingFile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSource, repositoryId]);

  const githubUrl =
    activeSource && fileContent
      ? buildGitHubFileUrl(
          repoUrl,
          defaultBranch,
          activeSource.filePath,
          activeSource.startLine,
          activeSource.endLine,
        )
      : fileContent?.githubUrl;

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <CardHeader className="shrink-0 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">Sources</h2>
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent-fg hover:underline"
            >
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
        <div className="max-h-[40%] shrink-0 overflow-y-auto border-b border-border-default px-4 pb-4">
          <FileReferenceList
            references={references}
            activeSource={activeSource}
            onSelect={onSelectSource}
          />
          {context.length > 0 ? (
            <details className="mt-3 rounded-md border border-border-default bg-canvas p-3">
              <summary className="cursor-pointer text-xs font-medium text-muted">
                Retrieved context ({context.length} chunks)
              </summary>
              <div className="mt-2 space-y-2">
                {context.map((chunk) => (
                  <button
                    key={chunk.id}
                    type="button"
                    onClick={() =>
                      onSelectSource({
                        filePath: chunk.filePath,
                        startLine: chunk.startLine,
                        endLine: chunk.endLine,
                      })
                    }
                    className="block w-full rounded-md border border-border-default bg-surface p-2 text-left text-xs hover:border-accent"
                  >
                    <span className="font-mono text-accent-fg">{chunk.filePath}</span>
                    {chunk.startLine != null ? (
                      <span className="text-muted"> · L{chunk.startLine}–{chunk.endLine}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </details>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {!activeSource ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center text-sm text-muted">
              <FileCode2 className="mb-2 h-8 w-8 text-border-default" />
              Click a file reference to view source code
            </div>
          ) : isLoadingFile ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : fileError ? (
            <p className="p-4 text-sm text-danger">{fileError}</p>
          ) : fileContent ? (
            <CodeViewer
              content={fileContent.content}
              language={fileContent.language}
              filePath={fileContent.path}
              startLine={activeSource.startLine}
              endLine={activeSource.endLine}
              githubUrl={githubUrl}
              className="h-full"
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
