import { NextResponse } from "next/server";
import { buildRepoTour } from "@/lib/repo/tour";
import { isDepthLevel } from "@/lib/ai/depth";

export async function GET(request: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  const depthParam = new URL(request.url).searchParams.get("depth");
  const depth = isDepthLevel(depthParam) ? depthParam : "plain";

  try {
    const tour = await buildRepoTour(repoId, depth);
    return NextResponse.json({ tour });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to build tour." },
      { status: 400 },
    );
  }
}
