import { RetrievedChunk } from "@/lib/retrieval/search";
import { DepthLevel, depthGuidance } from "@/lib/ai/depth";

export function formatContext(chunks: RetrievedChunk[]) {
  return chunks
    .map((chunk, index) => {
      const lines =
        chunk.startLine && chunk.endLine ? `:${chunk.startLine}-${chunk.endLine}` : "";
      return `Context ${index + 1}: ${chunk.filePath}${lines}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

export function repoQaSystemPrompt(depth: DepthLevel = "developer") {
  return [
    "You are an enterprise developer onboarding assistant.",
    "Answer questions using only the provided repository context.",
    "Format your answer in Markdown with headings, bullet lists, and fenced code blocks with language tags.",
    "When citing source files, use backticks with line ranges like `src/app/page.tsx:10-25`.",
    "Be clear, practical, and specific.",
    depthGuidance(depth),
    "If the context is insufficient, say what information is missing instead of guessing.",
  ].join(" ");
}

export function repoQaUserPrompt(question: string, chunks: RetrievedChunk[]) {
  return `Repository context:\n${formatContext(chunks)}\n\nQuestion: ${question}`;
}
