import { Lesson, StructuredAnswer } from "@/lib/ai/structured";

export type FileReference = {
  filePath: string;
  startLine: number | null;
  endLine: number | null;
  score: number;
};

export type RetrievedChunk = {
  id: string;
  filePath: string;
  content: string;
  startLine: number | null;
  endLine: number | null;
  score: number;
};

export type ChatMode = "lesson" | "answer";

export type ChatResponse = {
  answer: string;
  structured: StructuredAnswer | null;
  lesson: Lesson | null;
  usedModel: string;
  references: FileReference[];
  context: RetrievedChunk[];
  mode?: ChatMode;
  followUps?: string[];
};

export type ActiveSource = {
  filePath: string;
  startLine: number | null;
  endLine: number | null;
};

export type ChatMessage =
  | { id: string; role: "user"; content: string }
  | {
      id: string;
      role: "assistant";
      content: string;
      usedModel: string;
      structured: StructuredAnswer | null;
      lesson: Lesson | null;
      references: FileReference[];
      context: RetrievedChunk[];
    };

export function dedupeReferences(references: FileReference[]): FileReference[] {
  const seen = new Set<string>();
  return references
    .slice()
    .sort((a, b) => b.score - a.score)
    .filter((ref) => {
      const key = `${ref.filePath}:${ref.startLine ?? ""}:${ref.endLine ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
