import { NextResponse } from "next/server";
import { ingestGitHubRepository } from "@/lib/repo/ingest";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };

    if (!body.url) {
      return NextResponse.json({ error: "Repository URL is required." }, { status: 400 });
    }

    const result = await ingestGitHubRepository(body.url);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to ingest repository." },
      { status: 500 },
    );
  }
}
