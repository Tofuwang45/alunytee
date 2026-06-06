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

export type LessonStep = {
  id: string;
  title: string;
  explanation: string;
  filePath: string | null;
  startLine: number | null;
  endLine: number | null;
  snippet: CodeSnippet | null;
  checkpoint: string | null;
};

export type Lesson = {
  title: string;
  intro: string;
  steps: LessonStep[];
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

function parseCodeSnippet(raw: unknown): CodeSnippet | null {
  if (!raw || typeof raw !== "object") return null;
  const sn = raw as Record<string, unknown>;
  const code = typeof sn.code === "string" ? sn.code.trim() : "";
  if (!code) return null;
  const filePath = typeof sn.filePath === "string" ? sn.filePath : null;
  return {
    language:
      typeof sn.language === "string" && sn.language ? sn.language : languageFromPath(filePath),
    filePath,
    startLine: typeof sn.startLine === "number" ? sn.startLine : null,
    endLine: typeof sn.endLine === "number" ? sn.endLine : null,
    code,
  };
}

export function lessonStepToSpeech(step: LessonStep, index: number, total: number): string {
  const parts = [`Step ${index + 1} of ${total}. ${step.title}.`, step.explanation];
  if (step.checkpoint) parts.push(step.checkpoint);
  return parts.filter(Boolean).join(" ");
}

export function lessonToSpeech(lesson: Lesson, stepIndex = 0): string {
  const step = lesson.steps[stepIndex];
  if (!step) return lesson.intro;
  return [lesson.intro, lessonStepToSpeech(step, stepIndex, lesson.steps.length)]
    .filter(Boolean)
    .join(" ");
}

export function lessonToMarkdown(lesson: Lesson): string {
  const lines: string[] = [`# ${lesson.title}`, "", lesson.intro, ""];
  lesson.steps.forEach((step, i) => {
    lines.push(`## Step ${i + 1}: ${step.title}`, "", step.explanation, "");
    if (step.filePath) {
      lines.push(
        `\`${step.filePath}${step.startLine ? `:${step.startLine}${step.endLine && step.endLine !== step.startLine ? `-${step.endLine}` : ""}` : ""}\``,
        "",
      );
    }
    if (step.snippet) {
      lines.push("```" + step.snippet.language, step.snippet.code, "```", "");
    }
    if (step.checkpoint) {
      lines.push(`*${step.checkpoint}*`, "");
    }
  });
  return lines.join("\n").trim();
}

export function parseLesson(raw: unknown): Lesson | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const intro = typeof o.intro === "string" ? o.intro.trim() : "";
  if (!title || !intro || !Array.isArray(o.steps) || o.steps.length === 0) return null;

  const steps: LessonStep[] = [];
  for (const item of o.steps.slice(0, 8)) {
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    const stepTitle = typeof s.title === "string" ? s.title.trim() : "";
    const explanation = typeof s.explanation === "string" ? s.explanation.trim() : "";
    if (!stepTitle || !explanation) continue;
    const id = typeof s.id === "string" && s.id ? s.id : `step-${steps.length + 1}`;
    steps.push({
      id,
      title: stepTitle,
      explanation,
      filePath: typeof s.filePath === "string" ? s.filePath : null,
      startLine: typeof s.startLine === "number" ? s.startLine : null,
      endLine: typeof s.endLine === "number" ? s.endLine : null,
      snippet: parseCodeSnippet(s.snippet),
      checkpoint: typeof s.checkpoint === "string" ? s.checkpoint.trim() || null : null,
    });
  }

  if (!steps.length) return null;
  return { title, intro, steps };
}

const DEFINITION_RE =
  /(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:const|let|var|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/;

const COMMON_WORDS = new Set([
  "what",
  "where",
  "when",
  "which",
  "does",
  "this",
  "that",
  "page",
  "file",
  "code",
  "mean",
  "means",
  "explain",
  "show",
  "tell",
  "function",
  "component",
  "variable",
  "you",
  "the",
  "and",
  "for",
  "with",
  "into",
  "step",
  "steps",
  "graph",
]);

function questionIdentifiers(question: string): string[] {
  const words = question.match(/[A-Za-z_$][\w$]*/g) ?? [];
  const candidates = new Set<string>();
  for (const w of words) {
    if (w.length > 2 && !COMMON_WORDS.has(w.toLowerCase())) candidates.add(w.toLowerCase());
    if (w.length > 2) candidates.add(w.toLowerCase());
  }
  // Join adjacent words to catch spoken multi-word identifiers ("graph steps" -> "graphsteps").
  for (let i = 0; i < words.length - 1; i++) {
    candidates.add((words[i] + words[i + 1]).toLowerCase());
  }
  return [...candidates];
}

function extractDefinitionBlock(lines: string[], start: number, maxLines = 28): string {
  const out: string[] = [];
  let depth = 0;
  let opened = false;
  for (let i = start; i < lines.length && out.length < maxLines; i++) {
    const line = lines[i];
    out.push(line);
    for (const ch of line) {
      if (ch === "[" || ch === "{" || ch === "(") {
        depth++;
        opened = true;
      } else if (ch === "]" || ch === "}" || ch === ")") {
        depth--;
      }
    }
    if (opened && depth <= 0) break;
    // Single-line statement with no brackets: stop after a terminating semicolon.
    if (!opened && /;\s*$/.test(line) && i > start) break;
    if (!opened && i === start && /;\s*$/.test(line)) break;
  }
  return out.join("\n");
}

function describeDefinition(identifier: string, filePath: string, code: string): {
  summary: string;
  keyPoints: string[];
} {
  const firstLine = code.split(/\r?\n/)[0] ?? "";
  const name = filePath.split("/").pop() ?? filePath;
  const keyPoints: string[] = [];

  // Array literal: list its elements.
  if (/=\s*\[/.test(code)) {
    const strings = [...code.matchAll(/["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
    const unique = [...new Set(strings)];
    const preview = unique.slice(0, 12).join(", ");
    keyPoints.push(`It is an array/list defined in \`${name}\`.`);
    if (unique.length) {
      keyPoints.push(`It contains ${unique.length} value${unique.length === 1 ? "" : "s"}: ${preview}${unique.length > 12 ? ", …" : ""}.`);
    }
    return {
      summary: `\`${identifier}\` is a list defined in \`${filePath}\`. These are the ordered entries the code iterates over (for example, to render or drive a sequence of steps).`,
      keyPoints,
    };
  }

  // Function / arrow function.
  if (/\bfunction\b/.test(firstLine) || /=>/.test(code) || /\bfunction\b/.test(code)) {
    const isComponent = /^[A-Z]/.test(identifier) && /<[A-Za-z]/.test(code);
    keyPoints.push(`Defined in \`${name}\`.`);
    return {
      summary: isComponent
        ? `\`${identifier}\` is a React component defined in \`${filePath}\`. It returns the UI markup you see on the page.`
        : `\`${identifier}\` is a function defined in \`${filePath}\`. It encapsulates a reusable piece of logic.`,
      keyPoints,
    };
  }

  // Type / interface.
  if (/\b(type|interface|enum)\b/.test(firstLine)) {
    keyPoints.push(`This is a type definition in \`${name}\` describing the shape of data.`);
    return {
      summary: `\`${identifier}\` is a type/interface defined in \`${filePath}\`. It describes the structure that related values must follow.`,
      keyPoints,
    };
  }

  // Object literal / other const.
  if (/=\s*{/.test(code)) {
    keyPoints.push(`Defined as an object in \`${name}\`.`);
    return {
      summary: `\`${identifier}\` is an object defined in \`${filePath}\`, grouping related values or configuration.`,
      keyPoints,
    };
  }

  return {
    summary: `\`${identifier}\` is defined in \`${filePath}\`. Here is its definition from the code.`,
    keyPoints: [`Defined in \`${name}\`.`],
  };
}

function buildFocusedAnswer(
  question: string,
  chunks: RetrievedChunk[],
): StructuredAnswer | null {
  const candidates = questionIdentifiers(question);
  if (!candidates.length) return null;

  for (const chunk of chunks) {
    const lines = chunk.content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(DEFINITION_RE);
      if (!match) continue;
      const identifier = match[1];
      if (!candidates.includes(identifier.toLowerCase())) continue;

      const code = extractDefinitionBlock(lines, i);
      const startLine = chunk.startLine != null ? chunk.startLine + i : null;
      const endLine =
        startLine != null ? startLine + code.split(/\r?\n/).length - 1 : null;
      const { summary, keyPoints } = describeDefinition(identifier, chunk.filePath, code);

      return {
        summary: `${summary} Add OPENAI_API_KEY for a full natural-language explanation.`,
        keyPoints,
        steps: [],
        snippets: [
          {
            language: languageFromPath(chunk.filePath),
            filePath: chunk.filePath,
            startLine,
            endLine,
            code,
          },
        ],
      };
    }
  }

  return null;
}

export function buildFallbackStructured(
  question: string,
  chunks: RetrievedChunk[],
): StructuredAnswer {
  const focused = buildFocusedAnswer(question, chunks);
  if (focused) return focused;

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
