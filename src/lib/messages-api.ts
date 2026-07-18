import { apiGet } from "./api";

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  readAt: string | null;
  emailDeliveryStatus: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAdminMessages(params?: { limit?: number; unreadOnly?: boolean }) {
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.unreadOnly) search.set("unreadOnly", "true");
  const q = search.toString();
  return apiGet<AdminContactMessage[]>(`/api/admin/messages${q ? `?${q}` : ""}`);
}

export async function getAdminMessageById(id: string) {
  return apiGet<AdminContactMessage>(`/api/admin/messages/${encodeURIComponent(id)}`);
}

export function messageReadNeonClass(readAt: string | null): string {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider";
  if (readAt) {
    return `${base} border border-white/15 bg-white/5 text-white/60`;
  }
  return `${base} border border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-100 shadow-[0_0_12px_rgba(232,121,249,0.25)]`;
}

export function displayMessageSubject(subject: string): string {
  const trimmed = subject.trim();
  return trimmed || "Entamarket Logistics inquiry";
}
