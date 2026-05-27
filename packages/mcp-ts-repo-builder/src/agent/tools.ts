import fs from "node:fs";
import path from "node:path";
import { sanitizeSnippet } from "./sanitizer";

export function readRepoFile(repoPath: string, relativePath: string): string {
  const absolutePath = path.resolve(repoPath, relativePath);
  const content = fs.readFileSync(absolutePath, "utf8");
  return sanitizeSnippet(content);
}

export function listTypeScriptFiles(repoPath: string): string[] {
  const results: string[] = [];

  function walk(current: string) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === "dist") {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.name.endsWith(".ts")) {
        results.push(path.relative(repoPath, fullPath));
      }
    }
  }

  walk(path.resolve(repoPath));
  return results;
}
