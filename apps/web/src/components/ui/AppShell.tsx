"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils/cn";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-canvas flex h-screen overflow-hidden">
      <div className="relative z-10 hidden h-full p-3 md:block">
        <Sidebar />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 m-3 h-[calc(100%-1.5rem)]">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="glass rounded-full p-2.5 text-muted transition hover:text-fg"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-heading text-sm font-semibold text-fg">Alunyte</span>
        </header>
        <main className={cn("min-h-0 flex-1 overflow-hidden")}>{children}</main>
      </div>
    </div>
  );
}
