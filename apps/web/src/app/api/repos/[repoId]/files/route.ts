import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildGitHubFileUrl } from "@/lib/repo/github-links";

export async function GET(request: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const listOnly = searchParams.get("list") === "true";

  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    select: { id: true, url: true, defaultBranch: true },
  });

  if (!repo) {
    return NextResponse.json({ error: "Repository not found." }, { status: 404 });
  }

  if (listOnly || !path) {
    const files = await prisma.repoFile.findMany({
      where: { repositoryId: repoId },
      orderBy: { path: "asc" },
      select: { path: true, language: true },
    });
    return NextResponse.json({ files });
  }

  const file = await prisma.repoFile.findUnique({
    where: {
      repositoryId_path: { repositoryId: repoId, path },
    },
    select: { path: true, language: true, content: true },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const startLine = searchParams.get("startLine");
  const endLine = searchParams.get("endLine");

  return NextResponse.json({
    path: file.path,
    language: file.language,
    content: file.content,
    githubUrl: buildGitHubFileUrl(
      repo.url,
      repo.defaultBranch,
      file.path,
      startLine ? Number(startLine) : null,
      endLine ? Number(endLine) : null,
    ),
  });
}
