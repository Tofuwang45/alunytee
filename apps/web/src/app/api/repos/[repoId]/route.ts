import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    include: {
      files: { orderBy: { path: "asc" }, take: 30 },
      onboardingPaths: { orderBy: { createdAt: "desc" } },
      _count: { select: { files: true, chunks: true } },
    },
  });

  if (!repo) {
    return NextResponse.json({ error: "Repository not found." }, { status: 404 });
  }

  return NextResponse.json({ repo });
}
