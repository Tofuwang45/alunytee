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

export type ChatResponse = {
  answer: string;
  usedModel: string;
  references: FileReference[];
  context: RetrievedChunk[];
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
