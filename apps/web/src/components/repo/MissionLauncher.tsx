import Link from "next/link";
import {
  BookOpen,
  Compass,
  FileText,
  GitPullRequest,
  Rocket,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Mission = {
  id: string;
  label: string;
  description: string;
  href: (repoId: string) => string;
  icon: React.ReactNode;
  featured?: boolean;
};

const MISSIONS: Mission[] = [
  {
    id: "understand",
    label: "Understand this project",
    description: "A guided tour of what it does and how it fits together.",
    href: (id) => `/repos/${id}/tour`,
    icon: <Compass className="h-5 w-5" />,
    featured: true,
  },
  {
    id: "brief",
    label: "Generate onboarding brief",
    description: "A shareable summary you can keep or send to your team.",
    href: (id) => `/repos/${id}/brief`,
    icon: <FileText className="h-5 w-5" />,
    featured: true,
  },
  {
    id: "setup",
    label: "Set it up locally",
    description: "Find the steps to install and run the project.",
    href: (id) => `/repos/${id}/chat?q=${encodeURIComponent("How do I set this up and run it locally?")}`,
    icon: <Rocket className="h-5 w-5" />,
  },
  {
    id: "find",
    label: "Find where something happens",
    description: "Locate the code behind a specific feature.",
    href: (id) => `/repos/${id}/chat?q=${encodeURIComponent("Where is the main feature implemented?")}`,
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    id: "stakeholder",
    label: "Explain to a non-technical person",
    description: "A plain-English explanation, no jargon.",
    href: (id) => `/repos/${id}/chat?q=${encodeURIComponent("Explain what this project does in plain English.")}`,
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "contribute",
    label: "Prepare for first contribution",
    description: "What to know before making a change.",
    href: (id) => `/repos/${id}/chat?q=${encodeURIComponent("How do I prepare to make my first contribution?")}`,
    icon: <GitPullRequest className="h-5 w-5" />,
  },
];

export default function MissionLauncher({ repoId }: { repoId: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-fg">What do you want to do?</h2>
      <p className="mt-1 text-xs text-muted">Pick a goal — we will guide you through it.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MISSIONS.map((mission) => (
          <Link
            key={mission.id}
            href={mission.href(repoId)}
            className={cn(
              "group flex flex-col gap-2 rounded-md border p-4 transition",
              mission.featured
                ? "border-accent/40 bg-accent/5 hover:border-accent hover:bg-accent/10"
                : "border-border-default bg-surface hover:border-muted hover:bg-surface-overlay",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md",
                mission.featured ? "bg-accent/20 text-accent-fg" : "bg-canvas text-muted",
              )}
            >
              {mission.icon}
            </span>
            <span className="text-sm font-medium text-fg">{mission.label}</span>
            <span className="text-xs leading-5 text-muted">{mission.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
