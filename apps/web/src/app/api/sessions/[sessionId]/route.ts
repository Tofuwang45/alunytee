import { NextResponse } from "next/server";
import { isDepthLevel } from "@/lib/ai/depth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      repository: {
        select: { id: true, name: true, url: true, defaultBranch: true },
      },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      role: session.role,
      experience: session.experience,
      goal: session.goal,
      depth: session.depth,
      repositoryId: session.repositoryId,
      repository: session.repository,
      messages: session.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        references: m.references,
        context: m.context,
        usedModel: m.usedModel,
        createdAt: m.createdAt,
      })),
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  try {
    const body = (await request.json()) as { title?: string; depth?: string };
    const data: { title?: string; depth?: string } = {};

    if (body.title != null) data.title = body.title.trim() || "New chat";
    if (body.depth != null && isDepthLevel(body.depth)) data.depth = body.depth;

    const session = await prisma.chatSession.update({
      where: { id: sessionId },
      data,
      select: { id: true, title: true, depth: true },
    });

    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  try {
    await prisma.chatSession.delete({ where: { id: sessionId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
}
