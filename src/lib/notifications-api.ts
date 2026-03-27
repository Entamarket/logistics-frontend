import { apiGet, apiPatch, apiPost, getWebSocketBaseUrl } from "./api";

export interface NotificationRecord {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedShipmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getNotifications(limit = 50) {
  const q = limit !== 50 ? `?limit=${limit}` : "";
  return apiGet<NotificationRecord[]>(`/api/notifications${q}`);
}

export async function getUnreadNotificationCount() {
  return apiGet<{ count: number }>("/api/notifications/unread-count");
}

export async function markNotificationRead(id: string) {
  return apiPatch<NotificationRecord>(`/api/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead() {
  return apiPost<{ modified: number }>("/api/notifications/mark-all-read", {});
}

export async function getWsToken() {
  return apiGet<{ token: string }>("/api/auth/ws-token");
}

export function buildNotificationsWebSocketUrl(token: string): string {
  const base = (process.env.NEXT_PUBLIC_WS_URL || "").replace(/\/$/, "") || getWebSocketBaseUrl();
  return `${base}/ws?token=${encodeURIComponent(token)}`;
}
