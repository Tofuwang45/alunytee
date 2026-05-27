export type ParsedGitHubUrl = {
  owner: string;
  repo: string;
};

type GitHubTreeItem = {
  path: string;
  type: "blob" | "tree";
  size?: number;
  url: string;
};

export function parseGitHubUrl(url: string): ParsedGitHubUrl {
  const parsed = new URL(url.trim());

  if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") {
    throw new Error("Only github.com repository URLs are supported.");
  }

  const [owner, repoWithSuffix] = parsed.pathname.split("/").filter(Boolean);
  const repo = repoWithSuffix?.replace(/\.git$/, "");

  if (!owner || !repo) {
    throw new Error("Enter a valid GitHub repository URL like https://github.com/owner/repo.");
  }

  return { owner, repo };
}

async function githubFetch<T>(url: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "alunyte-onboarding-agent",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}): ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchGitHubRepository(url: string) {
  const parsed = parseGitHubUrl(url);
  const repoApiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;
  const repo = await githubFetch<{
    name: string;
    html_url: string;
    default_branch: string;
    owner: { login: string };
  }>(repoApiUrl);

  return {
    owner: repo.owner.login,
    name: repo.name,
    url: repo.html_url,
    defaultBranch: repo.default_branch,
  };
}

export async function fetchGitHubTree(owner: string, repo: string, branch: string) {
  const data = await githubFetch<{ tree: GitHubTreeItem[]; truncated: boolean }>(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );

  if (data.truncated) {
    throw new Error("GitHub returned a truncated tree. Try a smaller repository for this MVP.");
  }

  return data.tree.filter((item) => item.type === "blob");
}

export async function fetchGitHubFile(owner: string, repo: string, branch: string, path: string) {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  const response = await fetch(rawUrl, {
    headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch ${path} (${response.status}).`);
  }

  return response.text();
}
