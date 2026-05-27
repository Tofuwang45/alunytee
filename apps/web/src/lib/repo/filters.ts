const INCLUDED_EXTENSIONS = new Set([
  ".md",
  ".txt",
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".py",
  ".java",
  ".go",
  ".rs",
  ".php",
  ".rb",
  ".cs",
  ".cpp",
  ".c",
  ".h",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".sql",
]);

const IGNORED_PARTS = new Set([
  ".git",
  ".next",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "target",
  "vendor",
]);

const IGNORED_FILENAMES = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "composer.lock",
  "poetry.lock",
  "cargo.lock",
]);

const SECRET_PATTERNS = [
  /OPENAI_API_KEY\s*=/i,
  /AWS_SECRET_ACCESS_KEY\s*=/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /github_pat_[A-Za-z0-9_]+/i,
  /gh[pousr]_[A-Za-z0-9_]{20,}/i,
  /sk_live_[A-Za-z0-9]+/i,
  /\bSECRET\s*=\s*["']?[^"'\s]+/i,
  /\bPASSWORD\s*=\s*["']?[^"'\s]+/i,
];

export const DEFAULT_MAX_FILE_SIZE = Number(process.env.MAX_INGEST_FILE_BYTES ?? 120_000);

export function shouldIndexPath(path: string, size = 0, maxSize = DEFAULT_MAX_FILE_SIZE) {
  const normalized = path.replaceAll("\\", "/");
  const parts = normalized.split("/");
  const filename = parts.at(-1) ?? "";
  const lowerFilename = filename.toLowerCase();

  if (size > maxSize) return false;
  if (parts.some((part) => IGNORED_PARTS.has(part))) return false;
  if (IGNORED_FILENAMES.has(lowerFilename)) return false;
  if (lowerFilename.startsWith(".env")) return false;
  if (filename === "Dockerfile") return true;

  const extension = filename.includes(".")
    ? filename.slice(filename.lastIndexOf(".")).toLowerCase()
    : "";

  return INCLUDED_EXTENSIONS.has(extension);
}

export function containsSecrets(content: string) {
  return SECRET_PATTERNS.some((pattern) => pattern.test(content));
}

export function languageFromPath(path: string) {
  const filename = path.split("/").at(-1) ?? path;
  if (filename === "Dockerfile") return "dockerfile";
  const extension = filename.includes(".") ? filename.slice(filename.lastIndexOf(".") + 1) : "";
  const map: Record<string, string> = {
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    h: "c",
    java: "java",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    md: "markdown",
    php: "php",
    py: "python",
    rb: "ruby",
    rs: "rust",
    sql: "sql",
    toml: "toml",
    ts: "typescript",
    tsx: "typescript",
    txt: "text",
    yaml: "yaml",
    yml: "yaml",
  };

  return map[extension.toLowerCase()] ?? "text";
}
