import { NextResponse } from "next/server";
import { answerRepoQuestion, type AnswerMode } from "@/lib/ai/client";
import { isDepthLevel, type DepthLevel } from "@/lib/ai/depth";
import { prisma } from "@/lib/db";
import { detectWalkthroughIntent } from "@/lib/repo/lesson";
import { searchRepoChunks } from "@/lib/retrieval/search";

function buildHistory(
  turns: { role: string; content: string }[],
  max = 6,
): string {
  return turns
    .slice(-max)
    .map((t) => `${t.role === "user" ? "Learner" : "Tutor"}: ${t.content.slice(0, 240)}`)
    .join("\n");
}

function truncateTitle(text: string, max = 48) {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function isAnswerMode(value: unknown): value is AnswerMode {
  return value === "lesson" || value === "answer";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      repositoryId?: string;
      question?: string;
      depth?: string;
      mode?: string;
      stepFiles?: string[];
    };

    if (!body.question) {
      return NextResponse.json({ error: "question is required." }, { status: 400 });
    }

    let repositoryId = body.repositoryId;
    let depth: DepthLevel = "developer";
    let sessionId: string | undefined;
    let profile: { role?: string | null; experience?: string | null; goal?: string | null } = {};
    let history = "";

    // The learner can request a walkthrough at any time ("take me into the UI area").
    // Auto-upgrade to lesson mode so follow-ups branch into a focused walkthrough.
    const requestedMode: AnswerMode = isAnswerMode(body.mode) ? body.mode : "answer";
    const mode: AnswerMode =
      requestedMode === "lesson" || detectWalkthroughIntent(body.question)
        ? "lesson"
        : "answer";

    if (body.sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: body.sessionId },
        select: {
          id: true,
          repositoryId: true,
          title: true,
          depth: true,
          role: true,
          experience: true,
          goal: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 12,
            select: { role: true, content: true },
          },
        },
      });
      if (!session) {
        return NextResponse.json({ error: "Session not found." }, { status: 404 });
      }
      sessionId = session.id;
      repositoryId = session.repositoryId;
      depth = isDepthLevel(session.depth) ? session.depth : "developer";
      profile = { role: session.role, experience: session.experience, goal: session.goal };
      history = buildHistory(session.messages);
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

    let chunks = await searchRepoChunks(repositoryId, body.question);

    if (body.stepFiles?.length && mode === "answer") {
      const scoped = chunks.filter((c) => body.stepFiles!.includes(c.filePath));
      if (scoped.length) chunks = scoped;
    }

    const answer = await answerRepoQuestion(body.question, chunks, depth, mode, {
      repositoryId,
      profile,
      focusTopic: mode === "lesson" ? body.question : undefined,
      history,
    });

    const assistantTurn = sessionId
      ? await prisma.chatTurn.create({
          data: {
            sessionId,
            role: "assistant",
            content: answer.answer,
            references: answer.references,
            context: chunks,
            structured: answer.structured ?? undefined,
            lesson: answer.lesson ?? undefined,
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
