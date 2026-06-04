import { RetrievedChunk } from "@/lib/retrieval/search";

export type CodeSnippet = {
  language: string;
  filePath: string | null;
  startLine?: number | null;
  endLine?: number | null;
  code: string;
};

export type StructuredAnswer = {
  summary: string;
  keyPoints: string[];
  snippets: CodeSnippet[];
  steps: string[];
};

function languageFromPath(path: string | null): string {
  if (!path) return "text";
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    rs: "rust",
    go: "go",
    java: "java",
    json: "json",
    md: "markdown",
    sql: "sql",
    sh: "bash",
    yml: "yaml",
    yaml: "yaml",
    css: "css",
    html: "html",
  };
  return map[ext] ?? "text";
}

export function structuredToPlainText(s: StructuredAnswer): string {
  const parts = [s.summary];
  if (s.keyPoints.length) parts.push(s.keyPoints.map((p) => `• ${p}`).join("\n"));
  if (s.steps.length) parts.push(s.steps.map((step, i) => `${i + 1}. ${step}`).join("\n"));
  return parts.filter(Boolean).join("\n\n");
}

export function structuredToSpeech(s: StructuredAnswer): string {
  const parts = [s.summary, ...s.keyPoints];
  if (s.steps.length) parts.push(...s.steps.map((step, i) => `Step ${i + 1}: ${step}`));
  return parts.filter(Boolean).join(". ");
}

export function structuredToMarkdown(s: StructuredAnswer): string {
  const lines: string[] = [s.summary, ""];
  if (s.keyPoints.length) {
    lines.push("**Key points**", "");
    for (const p of s.keyPoints) lines.push(`- ${p}`);
    lines.push("");
  }
  if (s.steps.length) {
    lines.push("**Steps**", "");
    s.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    lines.push("");
  }
  for (const snip of s.snippets) {
    const label = snip.filePath
      ? `\`${snip.filePath}${snip.startLine ? `:${snip.startLine}${snip.endLine && snip.endLine !== snip.startLine ? `-${snip.endLine}` : ""}` : ""}\``
      : "";
    if (label) lines.push(label, "");
    lines.push("```" + snip.language, snip.code, "```", "");
  }
  return lines.join("\n").trim();
}

export function parseStructuredAnswer(raw: unknown): StructuredAnswer | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const summary = typeof o.summary === "string" ? o.summary.trim() : "";
  if (!summary) return null;

  const keyPoints = Array.isArray(o.keyPoints)
    ? o.keyPoints.filter((p): p is string => typeof p === "string" && p.trim().length > 0).slice(0, 6)
    : [];

  const steps = Array.isArray(o.steps)
    ? o.steps.filter((p): p is string => typeof p === "string" && p.trim().length > 0).slice(0, 8)
    : [];

  const snippets: CodeSnippet[] = [];
  if (Array.isArray(o.snippets)) {
    for (const item of o.snippets.slice(0, 3)) {
      if (!item || typeof item !== "object") continue;
      const sn = item as Record<string, unknown>;
      const code = typeof sn.code === "string" ? sn.code.trim() : "";
      if (!code) continue;
      const filePath = typeof sn.filePath === "string" ? sn.filePath : null;
      snippets.push({
        language:
          typeof sn.language === "string" && sn.language
            ? sn.language
            : languageFromPath(filePath),
        filePath,
        startLine: typeof sn.startLine === "number" ? sn.startLine : null,
        endLine: typeof sn.endLine === "number" ? sn.endLine : null,
        code,
      });
    }
  }

  return { summary, keyPoints, snippets, steps };
}

export function buildFallbackStructured(
  question: string,
  chunks: RetrievedChunk[],
): StructuredAnswer {
  const fileList = [...new Set(chunks.map((c) => c.filePath))].slice(0, 5);
  const top = chunks[0];

  const keyPoints = fileList.map((f) => `Review \`${f}\` for relevant context.`);

  const snippets: CodeSnippet[] = [];
  if (top) {
    const lines = top.content.split(/\r?\n/).slice(0, 12).join("\n");
    snippets.push({
      language: languageFromPath(top.filePath),
      filePath: top.filePath,
      startLine: top.startLine,
      endLine: top.endLine,
      code: lines,
    });
  }

  return {
    summary: `Found repository context related to "${question.slice(0, 80)}${question.length > 80 ? "…" : ""}". Add OPENAI_API_KEY for a synthesized answer.`,
    keyPoints: keyPoints.slice(0, 4),
    snippets,
    steps: [],
  };
}
