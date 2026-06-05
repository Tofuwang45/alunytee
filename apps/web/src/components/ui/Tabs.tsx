"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { cn } from "@/lib/utils/cn";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  className,
  children,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || "chat");
  const value = controlledValue ?? internalValue;

  function setValue(next: string) {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next);
  }

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "glass inline-flex gap-1 rounded-full p-1",
        className,
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.setValue(value)}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition",
        isActive
          ? "bg-white/15 text-fg shadow-[0_0_12px_var(--accent-glow)]"
          : "text-muted hover:text-fg",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");
  if (context.value !== value) return null;

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}
