export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: T | null; error: string }> {
  const res = await fetch(url, init);
  const text = await res.text();

  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    const snippet = text.trim().slice(0, 120);
    const isServerCrash =
      snippet.startsWith("Internal Server") ||
      snippet.includes("ENOENT") ||
      res.status >= 500;
    return {
      ok: false,
      status: res.status,
      data: null,
      error: isServerCrash
        ? "Server error — stop the dev server, run npm run dev:clean from the repo root, then retry."
        : snippet || `Request failed (${res.status})`,
    };
  }

  if (!res.ok) {
    const fromBody =
      data && typeof data === "object" && "error" in data
        ? String((data as { error?: string }).error)
        : "";
    return {
      ok: false,
      status: res.status,
      data,
      error: fromBody || text.trim().slice(0, 120) || `Request failed (${res.status})`,
    };
  }

  return { ok: true, status: res.status, data, error: "" };
}
