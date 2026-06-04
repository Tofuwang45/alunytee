import Link from "next/link";
import {
  Boxes,
  Cog,
  Database,
  FileText,
  FlaskConical,
  Layers,
  Network,
  Server,
} from "lucide-react";
import type { ConceptArea } from "@/lib/repo/concept-map";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<string, React.ReactNode> = {
  ui: <Layers className="h-4 w-4" />,
  api: <Server className="h-4 w-4" />,
  logic: <Network className="h-4 w-4" />,
  data: <Database className="h-4 w-4" />,
  config: <Cog className="h-4 w-4" />,
  tests: <FlaskConical className="h-4 w-4" />,
  docs: <FileText className="h-4 w-4" />,
  other: <Boxes className="h-4 w-4" />,
};

export default function RepoMap({
  repoId,
  areas,
  variant = "full",
}: {
  repoId: string;
  areas: ConceptArea[];
  variant?: "full" | "preview";
}) {
  const shown = variant === "preview" ? areas.slice(0, 6) : areas;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((area) => (
        <div key={area.id} className="flex flex-col rounded-md border border-border-default bg-surface p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-canvas text-muted">
              {ICONS[area.id] ?? ICONS.other}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-fg">{area.label}</h3>
              <p className="text-xs text-muted">{area.files.length} files</p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">{area.description}</p>

          {variant === "full" ? (
            <ul className="mt-3 space-y-1">
              {area.files.slice(0, 4).map((file) => (
                <li key={file} className="truncate">
                  <Link
                    href={`/repos/${repoId}/chat?q=${encodeURIComponent(`Explain ${file}`)}`}
                    className="font-mono text-xs text-accent-fg hover:underline"
                  >
                    {file}
                  </Link>
                </li>
              ))}
              {area.files.length > 4 ? (
                <li className="text-xs text-muted">+{area.files.length - 4} more</li>
              ) : null}
            </ul>
          ) : null}

          <Link
            href={`/repos/${repoId}/chat?q=${encodeURIComponent(`Explain the ${area.label} part of this codebase`)}`}
            className={cn(
              "mt-3 inline-flex w-fit items-center gap-1 rounded-md border border-border-default px-2.5 py-1 text-xs text-fg transition hover:border-accent hover:text-accent-fg",
            )}
          >
            Ask about this area
          </Link>
        </div>
      ))}
    </div>
  );
}
