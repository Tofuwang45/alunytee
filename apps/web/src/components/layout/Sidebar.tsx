"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquarePlus,
  MoreHorizontal,
  Pencil,
  Sparkles,
  TerminalSquare,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { fetchJson } from "@/lib/utils/fetch-json";
import { Button } from "@/components/ui/Button";

type SessionItem = {
  id: string;
  title: string;
  updatedAt: string;
  repositoryId: string;
  repositoryName: string;
};

type RepoItem = { id: string; name: string };

function groupSessions(sessions: SessionItem[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);

  const groups: { label: string; items: SessionItem[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const s of sessions) {
    const d = new Date(s.updatedAt);
    if (d >= startOfToday) groups[0].items.push(s);
    else if (d >= startOfYesterday) groups[1].items.push(s);
    else groups[2].items.push(s);
  }

  return groups.filter((g) => g.items.length > 0);
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [menuId, setMenuId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [sessResult, repoResult] = await Promise.all([
      fetchJson<{ sessions?: SessionItem[] }>("/api/sessions"),
      fetchJson<{ repos?: RepoItem[] }>("/api/repos"),
    ]);
    setSessions(sessResult.ok ? (sessResult.data?.sessions ?? []) : []);
    setRepos(repoResult.ok ? (repoResult.data?.repos ?? []) : []);
  }, []);

  useEffect(() => {
    void load();
  }, [load, pathname]);

  const grouped = useMemo(() => groupSessions(sessions), [sessions]);

  async function deleteSession(id: string) {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setMenuId(null);
    if (pathname === `/c/${id}`) router.push("/");
    void load();
  }

  async function renameSession(id: string) {
    const title = window.prompt("Rename chat");
    if (!title?.trim()) return;
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    setMenuId(null);
    void load();
  }

  function navClick() {
    onNavigate?.();
  }

  return (
    <aside className="glass-strong flex h-full w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 shadow-[0_0_16px_var(--accent-glow)]">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="font-heading text-sm font-semibold tracking-tight text-fg">Alunyte</span>
      </div>

      <div className="px-3 pb-3">
        <Link href="/" onClick={navClick}>
          <Button className="w-full justify-center gap-2" size="sm">
            <MessageSquarePlus className="h-4 w-4" />
            New chat
          </Button>
        </Link>
      </div>

      {repos.length > 0 ? (
        <div className="px-4 pb-2">
          <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Repositories
          </p>
          <ul className="max-h-28 space-y-0.5 overflow-y-auto">
            {repos.map((repo) => (
              <li key={repo.id}>
                <Link
                  href={`/repos/${repo.id}/explore`}
                  onClick={navClick}
                  className="block truncate rounded-lg px-2.5 py-1.5 text-xs text-muted transition hover:bg-white/8 hover:text-fg"
                >
                  {repo.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        {grouped.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((s) => (
                <li key={s.id} className="group relative">
                  <Link
                    href={`/c/${s.id}`}
                    onClick={navClick}
                    className={cn(
                      "block truncate rounded-xl py-2 pl-3 pr-8 text-sm transition",
                      pathname === `/c/${s.id}`
                        ? "glass-glow-ring bg-white/10 text-fg"
                        : "text-muted hover:bg-white/8 hover:text-fg",
                    )}
                  >
                    {s.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMenuId(menuId === s.id ? null : s.id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted opacity-0 transition hover:bg-white/10 group-hover:opacity-100"
                    aria-label="Session options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuId === s.id ? (
                    <div className="glass-strong absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden py-1">
                      <button
                        type="button"
                        onClick={() => void renameSession(s.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-fg hover:bg-white/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteSession(s.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-white/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {sessions.length === 0 ? (
          <p className="px-3 py-4 text-xs text-muted">No saved chats yet.</p>
        ) : null}
      </div>

      <div className="border-t border-glass-border p-2">
        <Link
          href="/progress"
          onClick={navClick}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted transition hover:bg-white/8 hover:text-fg"
        >
          <TrendingUp className="h-4 w-4" />
          Progress
        </Link>
        <Link
          href="/local-agent"
          onClick={navClick}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted transition hover:bg-white/8 hover:text-fg"
        >
          <TerminalSquare className="h-4 w-4" />
          Local agent
        </Link>
      </div>
    </aside>
  );
}
