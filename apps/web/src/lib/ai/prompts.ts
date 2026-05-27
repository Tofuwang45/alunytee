import { RetrievedChunk } from "@/lib/retrieval/search";

export function formatContext(chunks: RetrievedChunk[]) {
  return chunks
    .map((chunk, index) => {
      const lines =
        chunk.startLine && chunk.endLine ? `:${chunk.startLine}-${chunk.endLine}` : "";
      return `Context ${index + 1}: ${chunk.filePath}${lines}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

export function repoQaSystemPrompt() {
  return [
    "You are an enterprise developer onboarding assistant.",
    "Answer questions using only the provided repository context.",
    "Be clear, practical, and specific.",
    "When possible, cite file paths inline.",
    "If the context is insufficient, say what information is missing instead of guessing.",
  ].join(" ");
}

export function repoQaUserPrompt(question: string, chunks: RetrievedChunk[]) {
  return `Repository context:\n${formatContext(chunks)}\n\nQuestion: ${question}`;
}
