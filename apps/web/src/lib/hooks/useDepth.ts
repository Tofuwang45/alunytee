"use client";

import { useEffect, useState } from "react";
import { DepthLevel, isDepthLevel } from "@/lib/ai/depth";

const STORAGE_KEY = "alunyte-depth";

export function useDepth(): [DepthLevel, (next: DepthLevel) => void] {
  const [depth, setDepth] = useState<DepthLevel>("plain");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isDepthLevel(stored)) setDepth(stored);
  }, []);

  function update(next: DepthLevel) {
    setDepth(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return [depth, update];
}
