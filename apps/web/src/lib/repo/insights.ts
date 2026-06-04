import { prisma } from "@/lib/db";
import { buildConceptMap, ConceptArea } from "@/lib/repo/concept-map";

export type RepoInsights = {
  paths: string[];
  conceptMap: ConceptArea[];
  readme: { path: string; content: string } | null;
  summary: string;
  importantFiles: string[];
  runCommands: string[];
};

function firstParagraphs(markdown: string, maxChars = 600) {
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#.*$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  let out = "";
  for (const para of cleaned) {
    if ((out + " " + para).length > maxChars) break;
    out = out ? `${out}\n\n${para}` : para;
  }
  return out.trim();
}

function extractScripts(packageJson: string): string[] {
  try {
    const parsed = JSON.parse(packageJson) as { scripts?: Record<string, string> };
    if (!parsed.scripts) return [];
    return Object.keys(parsed.scripts)
      .filter((name) => ["dev", "start", "build", "test", "lint"].includes(name))
      .map((name) => `npm run ${name}`);
  } catch {
    return [];
  }
}

export function pickImportantFiles(paths: string[]): string[] {
  const picks: string[] = [];
  const add = (p?: string) => {
    if (p && !picks.includes(p)) picks.push(p);
  };

  add(paths.find((p) => /^readme\.md$/i.test(p.split("/").pop() ?? "")));
  add(paths.find((p) => /(^|\/)package\.json$/i.test(p)));
  add(paths.find((p) => /\/(index|main)\.(tsx?|jsx?|py|go|rs)$/i.test(p)));
  add(paths.find((p) => /\/page\.tsx$/i.test(p)));
  add(paths.find((p) => /(^|\/)(app|src)\/(layout|app)\.(tsx?|jsx?)$/i.test(p)));
  add(paths.find((p) => /schema\.prisma$/i.test(p)));

  for (const p of paths) {
    if (picks.length >= 6) break;
    add(p);
  }
  return picks.slice(0, 6);
}

export async function getRepoInsights(repositoryId: string): Promise<RepoInsights> {
  const files = await prisma.repoFile.findMany({
    where: { repositoryId },
    orderBy: { path: "asc" },
    select: { path: true },
  });
  const paths = files.map((f) => f.path);

  const readmeRow = await prisma.repoFile.findFirst({
    where: {
      repositoryId,
      path: { contains: "README" },
    },
    select: { path: true, content: true },
  });

  const pkgRow = await prisma.repoFile.findFirst({
    where: { repositoryId, path: { endsWith: "package.json" } },
    orderBy: { path: "asc" },
    select: { content: true },
  });

  const summary = readmeRow
    ? firstParagraphs(readmeRow.content)
    : "No README was found in this repository. Use the concept map and chat to explore what it does.";

  return {
    paths,
    conceptMap: buildConceptMap(paths),
    readme: readmeRow,
    summary,
    importantFiles: pickImportantFiles(paths),
    runCommands: pkgRow ? extractScripts(pkgRow.content) : [],
  };
}
