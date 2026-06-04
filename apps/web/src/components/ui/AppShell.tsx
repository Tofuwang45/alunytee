"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Github } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Breadcrumb = { label: string; href?: string };

function buildBreadcrumbs(pathname: string): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ label: "Dashboard", href: "/" }];

  if (pathname === "/progress") {
    crumbs.push({ label: "Progress" });
    return crumbs;
  }

  if (pathname === "/local-agent") {
    crumbs.push({ label: "Local agent" });
    return crumbs;
  }

  const repoMatch = pathname.match(/^\/repos\/([^/]+)/);
  if (repoMatch) {
    crumbs.push({ label: "Repository", href: `/repos/${repoMatch[1]}` });
  }

  return crumbs;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);
  const isChat = pathname.endsWith("/chat");

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border-default bg-canvas-inset">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-fg">
              <Github className="h-7 w-7" />
              <span className="hidden text-sm font-semibold sm:inline">Alunyte</span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink href="/" active={pathname === "/"}>
                Dashboard
              </NavLink>
              <NavLink href="/progress" active={pathname === "/progress"}>
                Progress
              </NavLink>
              <NavLink href="/local-agent" active={pathname === "/local-agent"}>
                Local agent
              </NavLink>
            </nav>
          </div>
        </div>
        {breadcrumbs.length > 1 ? (
          <div className="border-t border-border-muted">
            <div className="mx-auto flex w-full max-w-[1280px] items-center gap-1 overflow-x-auto px-4 py-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="flex shrink-0 items-center gap-1">
                  {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-muted" /> : null}
                  {crumb.href && index < breadcrumbs.length - 1 ? (
                    <Link href={crumb.href} className="text-accent-fg hover:underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-fg">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </header>
      <main className={cn("flex-1", isChat ? "flex flex-col overflow-hidden" : "")}>{children}</main>
    </div>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition",
        active ? "bg-surface text-fg font-medium" : "text-muted hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}
