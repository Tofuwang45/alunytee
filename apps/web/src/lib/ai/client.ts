import OpenAI from "openai";
import { repoQaSystemPrompt, repoQaUserPrompt } from "@/lib/ai/prompts";
import { DepthLevel } from "@/lib/ai/depth";
import {
  StructuredAnswer,
  buildFallbackStructured,
  parseStructuredAnswer,
  structuredToMarkdown,
} from "@/lib/ai/structured";
import { RetrievedChunk } from "@/lib/retrieval/search";

export type RepoAnswer = {
  answer: string;
  structured: StructuredAnswer | null;
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
  const structured = buildFallbackStructured(question, chunks);
  return {
    usedModel: "local-retrieval-fallback",
    references,
    structured,
    answer: structuredToMarkdown(structured),
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
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: repoQaSystemPrompt(depth) },
      { role: "user", content: repoQaUserPrompt(question, chunks) },
    ],
  });

  const raw = completion.choices[0]?.message.content ?? "";
  let structured: StructuredAnswer | null = null;

  if (raw) {
    try {
      structured = parseStructuredAnswer(JSON.parse(raw));
    } catch {
      structured = {
        summary: raw.slice(0, 500),
        keyPoints: [],
        snippets: [],
        steps: [],
      };
    }
  }

  if (!structured) {
    structured = {
      summary: "I could not generate an answer from the retrieved repository context.",
      keyPoints: [],
      snippets: [],
      steps: [],
    };
  }

  return {
    usedModel: model,
    structured,
    answer: structuredToMarkdown(structured),
    references: buildReferences(chunks),
  };
}
