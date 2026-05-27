import { RepoChunk } from "@prisma/client";
import { prisma } from "@/lib/db";

export type RetrievedChunk = Pick<RepoChunk, "id" | "filePath" | "content" | "startLine" | "endLine"> & {
  score: number;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "do",
  "does",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "repo",
  "repository",
  "the",
  "this",
  "to",
  "what",
  "where",
]);

function tokenize(input: string) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9_./-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function scoreChunk(chunk: RepoChunk, terms: string[]) {
  const text = `${chunk.filePath}\n${chunk.content}`.toLowerCase();
  let score = 0;

  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = text.match(new RegExp(escaped, "g"))?.length ?? 0;
    score += matches;
    if (chunk.filePath.toLowerCase().includes(term)) score += 4;
  }

  return score;
}

export async function searchRepoChunks(repositoryId: string, query: string, limit = 8): Promise<RetrievedChunk[]> {
  const terms = tokenize(query);
  const chunks = await prisma.repoChunk.findMany({
    where: { repositoryId },
    orderBy: { createdAt: "asc" },
    take: 1000,
  });

  const scored = chunks
    .map((chunk) => ({ ...chunk, score: terms.length ? scoreChunk(chunk, terms) : 1 }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length > 0) return scored;

  return chunks.slice(0, limit).map((chunk) => ({ ...chunk, score: 0.1 }));
}
