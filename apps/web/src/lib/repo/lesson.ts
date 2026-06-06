import { prisma } from "@/lib/db";
import { buildConceptMap, ConceptArea } from "@/lib/repo/concept-map";
import type { CodeSnippet, Lesson, LessonStep } from "@/lib/ai/structured";

const WALKTHROUGH_TRIGGERS = [
  "take me",
  "walk me",
  "walk through",
  "show me",
  "dive into",
  "deep dive",
  "explore",
  "guide me",
  "give me a tour",
  "tour",
  "go through",
  "step through",
  "teach me",
  "into the area",
  "start a guided walkthrough",
  "where should i start",
  "where do i start",
];

export function detectWalkthroughIntent(question: string): boolean {
  const q = question.toLowerCase();
  return WALKTHROUGH_TRIGGERS.some((t) => q.includes(t));
}

const AREA_SYNONYMS: Record<string, string[]> = {
  ui: ["ui", "user interface", "frontend", "front-end", "front end", "component", "components", "screen", "screens", "page", "pages", "view", "views", "design", "styling"],
  api: ["api", "apis", "endpoint", "endpoints", "route", "routes", "backend", "back-end", "back end", "controller", "controllers", "handler", "handlers", "server"],
  logic: ["logic", "service", "services", "business", "core", "domain", "utility", "utilities", "helper", "helpers", "agent"],
  data: ["data", "database", "db", "model", "models", "schema", "prisma", "migration", "migrations", "storage", "persistence"],
  config: ["config", "configuration", "setup", "build", "tooling", "environment", "env", "dependencies", "deploy", "deployment"],
  tests: ["test", "tests", "testing", "spec", "specs", "e2e", "coverage", "quality"],
  docs: ["docs", "documentation", "guide", "guides", "readme", "manual"],
};

export function matchConceptArea(query: string, areas: ConceptArea[]): ConceptArea | null {
  const q = query.toLowerCase();

  let best: { area: ConceptArea; score: number } | null = null;
  for (const area of areas) {
    const synonyms = AREA_SYNONYMS[area.id] ?? [area.label.toLowerCase()];
    let score = 0;
    for (const syn of synonyms) {
      if (q.includes(syn)) score += syn.length;
    }
    if (q.includes(area.label.toLowerCase())) score += area.label.length;
    if (score > 0 && (!best || score > best.score)) {
      best = { area, score };
    }
  }

  return best?.area ?? null;
}

const ENTRY_HINTS = [
  /\/(index|main)\.(tsx?|jsx?|py|go|rs)$/i,
  /\/page\.tsx$/i,
  /\/(layout|app)\.(tsx?|jsx?)$/i,
  /\/route\.(ts|js)$/i,
  /readme/i,
  /schema\.prisma$/i,
];

function rankAreaFiles(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const aEntry = ENTRY_HINTS.findIndex((re) => re.test(a));
    const bEntry = ENTRY_HINTS.findIndex((re) => re.test(b));
    const aScore = aEntry === -1 ? 99 : aEntry;
    const bScore = bEntry === -1 ? 99 : bEntry;
    if (aScore !== bScore) return aScore - bScore;
    const aDepth = a.split("/").length;
    const bDepth = b.split("/").length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.localeCompare(b);
  });
}

function languageFromPath(path: string): string {
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
    prisma: "prisma",
    sql: "sql",
    css: "css",
    html: "html",
  };
  return map[ext] ?? "text";
}

/**
 * Build a focused, deterministic walkthrough into a single concept area.
 * Works without an API key and adapts to whichever files the repo actually has.
 */
export async function buildAreaLesson(
  repositoryId: string,
  area: ConceptArea,
): Promise<Lesson> {
  const ranked = rankAreaFiles(area.files);
  const focusFiles = ranked.slice(0, 5);

  const rows = await prisma.repoFile.findMany({
    where: { repositoryId, path: { in: focusFiles } },
    select: { path: true, content: true, language: true },
  });
  const byPath = new Map(rows.map((r) => [r.path, r]));

  const steps: LessonStep[] = [];

  steps.push({
    id: "area-overview",
    title: `The ${area.label} area`,
    explanation: `${area.description} In this repository, the ${area.label} area has ${area.files.length} file${area.files.length === 1 ? "" : "s"}. We'll open the most important ones together. The key files are: ${focusFiles.map((f) => `\`${f}\``).join(", ")}.`,
    filePath: focusFiles[0] ?? null,
    startLine: null,
    endLine: null,
    snippet: null,
    checkpoint: "Want to start with the first file, or is there a specific one you're curious about?",
  });

  focusFiles.forEach((path, i) => {
    const row = byPath.get(path);
    const codeLines = row?.content
      ? row.content.split(/\r?\n/).slice(0, 14).join("\n")
      : "";
    const snippet: CodeSnippet | null = codeLines
      ? {
          language: row?.language ?? languageFromPath(path),
          filePath: path,
          startLine: 1,
          endLine: Math.min(14, codeLines.split("\n").length),
          code: codeLines,
        }
      : null;
    const name = path.split("/").pop() ?? path;
    steps.push({
      id: `file-${i + 1}`,
      title: name,
      explanation: `\`${path}\` is part of the ${area.label} area. Open it in the Sources panel on the right to read it in full — here's the top of the file to get oriented.`,
      filePath: path,
      startLine: null,
      endLine: null,
      snippet,
      checkpoint: `Any questions about \`${name}\` before we move on?`,
    });
  });

  steps.push({
    id: "area-wrap",
    title: "How this fits together",
    explanation: `These files make up the ${area.label} layer. From here you can ask me to explain any file line by line, compare two of them, or jump to a different area of the codebase.`,
    filePath: null,
    startLine: null,
    endLine: null,
    snippet: null,
    checkpoint: "Where would you like to go next?",
  });

  return {
    title: `${area.label} walkthrough`,
    intro: `Let's explore the ${area.label} area of this codebase together, one file at a time.`,
    steps,
  };
}

/**
 * Repo-derived, context-aware follow-up suggestions.
 * Chips change based on the areas that actually exist and the current focus.
 */
export function buildFollowUps(areas: ConceptArea[], currentAreaId?: string): string[] {
  const others = areas
    .filter((a) => a.id !== currentAreaId && a.id !== "other" && a.files.length > 0)
    .slice(0, 3)
    .map((a) => `Take me into ${a.label}`);

  const connective = currentAreaId
    ? ["Explain the last step more simply", "How does this connect to the rest?"]
    : ["Explain this more simply", "Which file should I read first?"];

  return [...others, ...connective].slice(0, 4);
}

export async function getConceptAreas(repositoryId: string): Promise<ConceptArea[]> {
  const files = await prisma.repoFile.findMany({
    where: { repositoryId },
    orderBy: { path: "asc" },
    select: { path: true },
  });
  return buildConceptMap(files.map((f) => f.path));
}
