import { NextResponse } from "next/server";
import { buildOnboardingBrief } from "@/lib/repo/brief";
import { isDepthLevel } from "@/lib/ai/depth";

export async function GET(request: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const { repoId } = await params;
  const depthParam = new URL(request.url).searchParams.get("depth");
  const depth = isDepthLevel(depthParam) ? depthParam : "plain";

  try {
    const brief = await buildOnboardingBrief(repoId, depth);
    return NextResponse.json({ brief });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to build brief." },
      { status: 400 },
    );
  }
}
