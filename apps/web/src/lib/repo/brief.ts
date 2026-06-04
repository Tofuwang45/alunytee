import { prisma } from "@/lib/db";
import { getRepoInsights } from "@/lib/repo/insights";
import { DepthLevel } from "@/lib/ai/depth";

export type BriefSection = {
  heading: string;
  body?: string;
  bullets?: string[];
};

export type OnboardingBrief = {
  title: string;
  generatedAt: string;
  sections: BriefSection[];
  markdown: string;
};

function toMarkdown(title: string, sections: BriefSection[]): string {
  const lines: string[] = [`# ${title}`, ""];
  for (const section of sections) {
    lines.push(`## ${section.heading}`, "");
    if (section.body) lines.push(section.body, "");
    if (section.bullets?.length) {
      for (const b of section.bullets) lines.push(`- ${b}`);
      lines.push("");
    }
  }
  return lines.join("\n").trim();
}

export async function buildOnboardingBrief(
  repositoryId: string,
  depth: DepthLevel,
): Promise<OnboardingBrief> {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    select: { name: true, url: true, defaultBranch: true },
  });
  if (!repo) throw new Error("Repository not found.");

  const insights = await getRepoInsights(repositoryId);
  if (!insights.paths.length) {
    throw new Error("No indexed files. Ingest the repository first.");
  }

  const topDirs = [...new Set(insights.paths.map((p) => p.split("/")[0]).filter(Boolean))].slice(0, 10);

  const audience: Record<DepthLevel, string> = {
    plain: "Written for a non-technical reader.",
    product: "Written for a product manager.",
    developer: "Written for a developer joining the project.",
    deep: "Written for an engineer who needs architectural depth.",
  };

  const sections: BriefSection[] = [
    { heading: "Summary", body: `${audience[depth]}\n\n${insights.summary}` },
    {
      heading: "Main areas",
      bullets: insights.conceptMap.map((a) => `${a.label}: ${a.description} (${a.files.length} files)`),
    },
    {
      heading: "Project structure",
      bullets: topDirs.length ? topDirs.map((d) => `${d}/`) : ["Files are mostly at the repository root."],
    },
    { heading: "Read these first", bullets: insights.importantFiles },
    {
      heading: "How to run locally",
      bullets: insights.runCommands.length
        ? insights.runCommands
        : ["No package scripts detected — see the README for setup."],
    },
    {
      heading: "Suggested learning path",
      bullets: [
        "Read the summary and README.",
        "Skim the main areas above, largest first.",
        "Open the key files and trace their imports.",
        "Ask the assistant focused questions as you go.",
      ],
    },
    {
      heading: "Questions to ask the team",
      bullets: [
        "What is the highest-priority area to understand first?",
        "Are there parts of the codebase that are being deprecated?",
        "What is the deployment and release process?",
      ],
    },
  ];

  const title = `Onboarding brief: ${repo.name}`;
  return {
    title,
    generatedAt: new Date().toISOString(),
    sections,
    markdown: toMarkdown(title, [
      { heading: "Repository", body: `${repo.url} (branch ${repo.defaultBranch ?? "main"})` },
      ...sections,
    ]),
  };
}
