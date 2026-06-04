"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { id: "home", label: "Home", suffix: "" },
  { id: "explore", label: "Explore", suffix: "/explore" },
  { id: "chat", label: "Chat", suffix: "/chat" },
] as const;

export default function RepoTabs({ repoId }: { repoId: string }) {
  const pathname = usePathname();
  const base = `/repos/${repoId}`;

  function isActive(suffix: string) {
    if (suffix === "") return pathname === base;
    return pathname.startsWith(`${base}${suffix}`);
  }

  return (
    <nav className="border-b border-border-default" aria-label="Repository">
      <div className="flex gap-0 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`${base}${tab.suffix}`}
            className={cn(
              "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition -mb-px",
              isActive(tab.suffix)
                ? "border-[#f78166] text-fg"
                : "border-transparent text-muted hover:text-fg",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
