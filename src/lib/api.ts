export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/** WebSocket URL for the same host as the API (path /ws). */
export function getWebSocketBaseUrl(): string {
  const base = API_BASE.replace(/\/$/, "");
  if (base.startsWith("https://")) {
    return `wss://${base.slice("https://".length)}`;
  }
  if (base.startsWith("http://")) {
    return `ws://${base.slice("http://".length)}`;
  }
  return `ws://${base}`;
}

export type ApiResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; code?: string };

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const body = json as { message?: string; code?: string };
    return {
      success: false,
      message: body.message || res.statusText || "Request failed",
      ...(body.code ? { code: body.code } : {}),
    };
  }
  return json as ApiResponse<T>;
}

export function apiPost<T>(path: string, body: object): Promise<ApiResponse<T>> {
  return api<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  return api<T>(path, { method: "GET" });
}

export function apiPatch<T>(path: string, body: object): Promise<ApiResponse<T>> {
  return api<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}
