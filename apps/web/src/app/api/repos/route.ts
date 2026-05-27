import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const repos = await prisma.repository.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { files: true, chunks: true, onboardingPaths: true },
      },
    },
  });

  return NextResponse.json({ repos });
}
