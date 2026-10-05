// lib/fetcher.ts

// Helper côté client : lève une Error avec le message renvoyé par l'API
export async function fetcher<T = unknown>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      typeof body?.error === "string" ? body.error : `HTTP ${res.status}`;
    throw new Error(message);
  }

  // 204 No Content (DELETE programs)
  if (res.status === 204) return undefined as T;

  return res.json();
}