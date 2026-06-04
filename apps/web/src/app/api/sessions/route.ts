import { NextResponse } from "next/server";
import { depthFromIntake, isDepthLevel } from "@/lib/ai/depth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        repository: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        updatedAt: s.updatedAt,
        repositoryId: s.repository.id,
        repositoryName: s.repository.name,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list sessions." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      repositoryId?: string;
      role?: string;
      experience?: string;
      goal?: string;
      depth?: string;
    };

    if (!body.repositoryId) {
      return NextResponse.json({ error: "repositoryId is required." }, { status: 400 });
    }

    const repo = await prisma.repository.findUnique({
      where: { id: body.repositoryId },
      select: { id: true },
    });
    if (!repo) {
      return NextResponse.json({ error: "Repository not found." }, { status: 404 });
    }

    const depth =
      body.depth && isDepthLevel(body.depth)
        ? body.depth
        : depthFromIntake(body.role ?? "other", body.experience ?? "new");

    const session = await prisma.chatSession.create({
      data: {
        repositoryId: body.repositoryId,
        role: body.role ?? null,
        experience: body.experience ?? null,
        goal: body.goal ?? null,
        depth,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create session." },
      { status: 500 },
    );
  }
}
