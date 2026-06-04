export function buildGitHubFileUrl(
  repoUrl: string,
  defaultBranch: string | null | undefined,
  filePath: string,
  startLine?: number | null,
  endLine?: number | null,
) {
  const branch = defaultBranch ?? "main";
  const base = repoUrl.replace(/\/$/, "");
  const blobUrl = `${base}/blob/${branch}/${filePath}`;

  if (startLine != null && startLine > 0) {
    if (endLine != null && endLine > startLine) {
      return `${blobUrl}#L${startLine}-L${endLine}`;
    }
    return `${blobUrl}#L${startLine}`;
  }

  return blobUrl;
}

export function languageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    sql: "sql",
    sh: "bash",
    toml: "toml",
    xml: "xml",
  };
  if (path.endsWith("Dockerfile")) return "dockerfile";
  return map[ext] ?? "text";
}
