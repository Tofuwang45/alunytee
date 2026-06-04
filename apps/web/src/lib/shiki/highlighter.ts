import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: [
        "typescript",
        "tsx",
        "javascript",
        "jsx",
        "python",
        "json",
        "markdown",
        "css",
        "html",
        "yaml",
        "bash",
        "sql",
        "go",
        "rust",
        "java",
        "toml",
        "dockerfile",
        "text",
      ],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, language: string) {
  const highlighter = await getHighlighter();
  const lang = highlighter.getLoadedLanguages().includes(language as never) ? language : "text";
  try {
    return highlighter.codeToHtml(code, { lang, theme: "github-dark" });
  } catch {
    return highlighter.codeToHtml(code, { lang: "text", theme: "github-dark" });
  }
}
