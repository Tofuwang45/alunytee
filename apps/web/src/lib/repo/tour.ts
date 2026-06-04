import { getRepoInsights } from "@/lib/repo/insights";
import { DepthLevel } from "@/lib/ai/depth";

export type TourStep = {
  id: string;
  title: string;
  body: string;
  files: string[];
};

export type RepoTour = {
  title: string;
  intro: string;
  steps: TourStep[];
};

const DEPTH_INTRO: Record<DepthLevel, string> = {
  plain: "A plain-English walkthrough of what this project is and how it fits together.",
  product: "A product-level tour of the main capabilities and how they connect.",
  developer: "A developer tour from entry points through the main areas of the code.",
  deep: "An architectural tour of the major subsystems, data flow, and key files.",
};

export async function buildRepoTour(repositoryId: string, depth: DepthLevel): Promise<RepoTour> {
  const insights = await getRepoInsights(repositoryId);

  if (!insights.paths.length) {
    throw new Error("No indexed files. Ingest the repository first.");
  }

  const topDirs = [...new Set(insights.paths.map((p) => p.split("/")[0]).filter(Boolean))].slice(0, 8);
  const biggestAreas = insights.conceptMap.slice(0, 3);

  const steps: TourStep[] = [
    {
      id: "what",
      title: "What this project does",
      body: insights.summary,
      files: insights.readme ? [insights.readme.path] : [],
    },
    {
      id: "areas",
      title: "The main areas",
      body: insights.conceptMap.length
        ? `This codebase breaks down into ${insights.conceptMap.length} areas: ${insights.conceptMap
            .map((a) => `${a.label} (${a.files.length})`)
            .join(", ")}.`
        : "No clear areas were detected.",
      files: [],
    },
    {
      id: "structure",
      title: "How it is organized",
      body: topDirs.length
        ? `Top-level folders: ${topDirs.join(", ")}. Each maps to one or more of the areas above.`
        : "The project is mostly flat with files at the root.",
      files: [],
    },
    {
      id: "start",
      title: "Read these first",
      body: "These files give you the fastest understanding of the project.",
      files: insights.importantFiles,
    },
    {
      id: "run",
      title: "How to run it",
      body: insights.runCommands.length
        ? `Common commands: ${insights.runCommands.join(", ")}. Check the README for environment setup.`
        : "No package scripts were detected. Check the README for setup and run instructions.",
      files: insights.paths.filter((p) => /package\.json$|readme/i.test(p)).slice(0, 2),
    },
    {
      id: "change",
      title: "Where to make changes",
      body: biggestAreas.length
        ? `Most work happens in ${biggestAreas
            .map((a) => a.label)
            .join(", ")}. Start in the relevant area, then trace imports outward.`
        : "Explore the files list to find the relevant area.",
      files: biggestAreas.flatMap((a) => a.files.slice(0, 2)),
    },
  ];

  return {
    title: "Guided tour",
    intro: DEPTH_INTRO[depth],
    steps,
  };
}
