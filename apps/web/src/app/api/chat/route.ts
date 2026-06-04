import { NextResponse } from "next/server";
import { answerRepoQuestion } from "@/lib/ai/client";
import { isDepthLevel, type DepthLevel } from "@/lib/ai/depth";
import { prisma } from "@/lib/db";
import { searchRepoChunks } from "@/lib/retrieval/search";

function truncateTitle(text: string, max = 48) {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      repositoryId?: string;
      question?: string;
      depth?: string;
    };

    if (!body.question) {
      return NextResponse.json({ error: "question is required." }, { status: 400 });
    }

    let repositoryId = body.repositoryId;
    let depth: DepthLevel = "developer";
    let sessionId: string | undefined;

    if (body.sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: body.sessionId },
        select: { id: true, repositoryId: true, title: true, depth: true },
      });
      if (!session) {
        return NextResponse.json({ error: "Session not found." }, { status: 404 });
      }
      sessionId = session.id;
      repositoryId = session.repositoryId;
      depth = isDepthLevel(session.depth) ? session.depth : "developer";
    } else if (body.depth && isDepthLevel(body.depth)) {
      depth = body.depth;
    }

    if (!repositoryId) {
      return NextResponse.json(
        { error: "sessionId or repositoryId is required." },
        { status: 400 },
      );
    }

    const userTurn = sessionId
      ? await prisma.chatTurn.create({
          data: {
            sessionId,
            role: "user",
            content: body.question,
          },
        })
      : null;

    const chunks = await searchRepoChunks(repositoryId, body.question);
    const answer = await answerRepoQuestion(body.question, chunks, depth);

    const assistantTurn = sessionId
      ? await prisma.chatTurn.create({
          data: {
            sessionId,
            role: "assistant",
            content: answer.answer,
            references: answer.references,
            context: chunks,
            usedModel: answer.usedModel,
          },
        })
      : null;

    if (sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { title: true },
      });
      const titleUpdate =
        session?.title === "New chat"
          ? { title: truncateTitle(body.question) }
          : {};

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { ...titleUpdate, updatedAt: new Date() },
      });
    }

    return NextResponse.json({
      ...answer,
      context: chunks,
      userMessageId: userTurn?.id,
      assistantMessageId: assistantTurn?.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to answer question." },
      { status: 500 },
    );
  }
}
