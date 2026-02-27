const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type ApiResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string };

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
    return {
      success: false,
      message: (json as { message?: string }).message || res.statusText || "Request failed",
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
