export type RepoChunkInput = {
  filePath: string;
  content: string;
  startLine: number;
  endLine: number;
};

export function chunkFile(filePath: string, content: string, maxLines = 80, overlapLines = 12) {
  const lines = content.split(/\r?\n/);
  const chunks: RepoChunkInput[] = [];
  let start = 0;

  while (start < lines.length) {
    const end = Math.min(start + maxLines, lines.length);
    const chunkText = lines.slice(start, end).join("\n").trim();

    if (chunkText.length > 0) {
      chunks.push({
        filePath,
        content: chunkText,
        startLine: start + 1,
        endLine: end,
      });
    }

    if (end === lines.length) break;
    start = Math.max(end - overlapLines, start + 1);
  }

  return chunks;
}
