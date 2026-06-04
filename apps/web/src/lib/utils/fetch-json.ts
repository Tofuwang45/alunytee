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
    return {
      ok: false,
      status: res.status,
      data: null,
      error: snippet || `Request failed (${res.status})`,
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
