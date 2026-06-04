import OpenAI from "openai";
import { repoQaSystemPrompt, repoQaUserPrompt } from "@/lib/ai/prompts";
import { DepthLevel } from "@/lib/ai/depth";
import { RetrievedChunk } from "@/lib/retrieval/search";

export type RepoAnswer = {
  answer: string;
  references: {
    filePath: string;
    startLine: number | null;
    endLine: number | null;
    score: number;
  }[];
  usedModel: string;
};

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildReferences(chunks: RetrievedChunk[]) {
  const seen = new Set<string>();
  return chunks
    .map((chunk) => ({
      filePath: chunk.filePath,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      score: chunk.score,
    }))
    .sort((a, b) => b.score - a.score)
    .filter((ref) => {
      const key = `${ref.filePath}:${ref.startLine ?? ""}:${ref.endLine ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function fallbackAnswer(question: string, chunks: RetrievedChunk[]): RepoAnswer {
  const references = buildReferences(chunks);
  const fileList = [...new Set(chunks.map((chunk) => chunk.filePath))].slice(0, 5);
  const excerpts = chunks
    .slice(0, 3)
    .map((chunk) => {
      const preview = chunk.content.split(/\r?\n/).slice(0, 6).join("\n");
      return `From ${chunk.filePath}${chunk.startLine ? `:${chunk.startLine}` : ""}:\n${preview}`;
    })
    .join("\n\n");

  return {
    usedModel: "local-retrieval-fallback",
    references,
    answer: [
      `I found repository context that appears relevant to "${question}".`,
      fileList.length ? `Start with ${fileList.map((file) => `\`${file}\``).join(", ")}.` : "",
      "Add `OPENAI_API_KEY` to get a synthesized answer; for now, here are the most relevant excerpts:",
      excerpts,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

export async function answerRepoQuestion(
  question: string,
  chunks: RetrievedChunk[],
  depth: DepthLevel = "developer",
): Promise<RepoAnswer> {
  const client = getOpenAIClient();

  if (!client) {
    return fallbackAnswer(question, chunks);
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: repoQaSystemPrompt(depth) },
      { role: "user", content: repoQaUserPrompt(question, chunks) },
    ],
  });

  return {
    usedModel: model,
    answer:
      completion.choices[0]?.message.content ??
      "I could not generate an answer from the retrieved repository context.",
    references: buildReferences(chunks),
  };
}
