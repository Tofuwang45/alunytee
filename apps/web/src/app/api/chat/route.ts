import { NextResponse } from "next/server";
import { answerRepoQuestion } from "@/lib/ai/client";
import { isDepthLevel } from "@/lib/ai/depth";
import { searchRepoChunks } from "@/lib/retrieval/search";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      repositoryId?: string;
      question?: string;
      depth?: string;
    };

    if (!body.repositoryId || !body.question) {
      return NextResponse.json(
        { error: "repositoryId and question are required." },
        { status: 400 },
      );
    }

    const depth = isDepthLevel(body.depth) ? body.depth : "developer";
    const chunks = await searchRepoChunks(body.repositoryId, body.question);
    const answer = await answerRepoQuestion(body.question, chunks, depth);

    return NextResponse.json({ ...answer, context: chunks });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to answer question." },
      { status: 500 },
    );
  }
}
