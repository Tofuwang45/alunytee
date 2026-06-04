"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils/cn";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <div className="hidden h-full md:block">
        <Sidebar />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full shadow-xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-border-default bg-canvas-inset px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-muted hover:bg-surface hover:text-fg"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-fg">Alunyte</span>
          {mobileOpen ? null : (
            <button
              type="button"
              className="sr-only"
              onClick={() => setMobileOpen(false)}
            >
              <X />
            </button>
          )}
        </header>
        <main className={cn("min-h-0 flex-1 overflow-hidden")}>{children}</main>
      </div>
    </div>
  );
}
