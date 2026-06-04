export type ConceptArea = {
  id: string;
  label: string;
  description: string;
  files: string[];
};

type Rule = {
  id: string;
  label: string;
  description: string;
  match: (path: string) => boolean;
};

const RULES: Rule[] = [
  {
    id: "ui",
    label: "User Interface",
    description: "Pages, screens, and components users interact with.",
    match: (p) =>
      /(^|\/)(components?|pages?|app|views?|ui|screens?)(\/|$)/i.test(p) ||
      /\.(tsx|jsx|vue|svelte)$/i.test(p),
  },
  {
    id: "api",
    label: "APIs & Routes",
    description: "Endpoints and request handlers that power features.",
    match: (p) => /(^|\/)(api|routes?|controllers?|handlers?|endpoints?)(\/|$)/i.test(p),
  },
  {
    id: "logic",
    label: "Logic & Services",
    description: "Business logic, services, and core functionality.",
    match: (p) => /(^|\/)(lib|services?|core|domain|agent|utils?|helpers?)(\/|$)/i.test(p),
  },
  {
    id: "data",
    label: "Data & Models",
    description: "Database schema, models, and how data is stored.",
    match: (p) =>
      /(^|\/)(models?|schema|prisma|db|database|entities|migrations?)(\/|$)/i.test(p) ||
      /\.(prisma|sql)$/i.test(p),
  },
  {
    id: "config",
    label: "Configuration",
    description: "Build tooling, dependencies, and environment setup.",
    match: (p) =>
      /(package\.json|tsconfig|.*\.config\.|dockerfile|\.env|\.ya?ml$|\.toml$)/i.test(
        p.split("/").pop() ?? p,
      ),
  },
  {
    id: "tests",
    label: "Tests",
    description: "Automated tests and quality checks.",
    match: (p) => /(\.test\.|\.spec\.|(^|\/)(tests?|__tests__|e2e|cypress)(\/|$))/i.test(p),
  },
  {
    id: "docs",
    label: "Docs",
    description: "Documentation and written guides.",
    match: (p) => /\.(md|mdx|txt|rst)$/i.test(p),
  },
];

export function buildConceptMap(paths: string[]): ConceptArea[] {
  const areas = new Map<string, ConceptArea>();
  const assigned = new Set<string>();

  for (const rule of RULES) {
    areas.set(rule.id, {
      id: rule.id,
      label: rule.label,
      description: rule.description,
      files: [],
    });
  }

  // Tests/config/docs take precedence over broad UI/logic matches.
  const ordered = [...RULES].sort((a, b) => {
    const priority = ["tests", "config", "docs", "data", "api", "ui", "logic"];
    return priority.indexOf(a.id) - priority.indexOf(b.id);
  });

  for (const path of paths) {
    for (const rule of ordered) {
      if (rule.match(path)) {
        areas.get(rule.id)!.files.push(path);
        assigned.add(path);
        break;
      }
    }
  }

  const other: ConceptArea = {
    id: "other",
    label: "Other",
    description: "Files that do not fit a common category.",
    files: paths.filter((p) => !assigned.has(p)),
  };

  const result = [...areas.values()].filter((a) => a.files.length > 0);
  if (other.files.length > 0) result.push(other);
  return result.sort((a, b) => b.files.length - a.files.length);
}
