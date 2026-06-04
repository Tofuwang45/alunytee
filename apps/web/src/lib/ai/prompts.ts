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
    "Answer using only the provided repository context.",
    "Be concise: no filler, no restating the question, no long introductions.",
    depthGuidance(depth),
    "If context is insufficient, say what is missing instead of guessing.",
    "Respond with a single JSON object (no markdown outside JSON) matching this schema:",
    JSON.stringify({
      summary: "One sentence direct answer.",
      keyPoints: ["Up to 4 short bullets with the most important facts."],
      snippets: [
        {
          language: "typescript",
          filePath: "src/example.ts",
          startLine: 10,
          endLine: 25,
          code: "// only include when code helps; keep snippets short",
        },
      ],
      steps: ["Only for how-to/setup questions; otherwise empty array."],
    }),
    "Rules: keyPoints max 4 items; snippets max 2 and only when code is genuinely needed; steps max 6 and only for procedural questions; omit empty arrays where possible.",
  ].join(" ");
}

export function repoQaUserPrompt(question: string, chunks: RetrievedChunk[]) {
  return `Repository context:\n${formatContext(chunks)}\n\nQuestion: ${question}`;
}
