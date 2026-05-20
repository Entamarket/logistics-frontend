import { apiGet, apiPost, apiPatch } from "./api";

export interface ComplaintData {
  id: string;
  userId: string;
  reporterType: "client" | "rider";
  subject: string;
  message: string;
  phone: string;
  relatedShipmentId: string | null;
  status: "open" | "in_review" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintReporter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AdminComplaintData extends ComplaintData {
  reporter: ComplaintReporter;
}

export interface CreateComplaintPayload {
  subject: string;
  message: string;
  phone: string;
  relatedShipmentId?: string;
}

export async function createComplaint(payload: CreateComplaintPayload) {
  return apiPost<ComplaintData>("/api/complaints", payload);
}

export async function getMyComplaints() {
  return apiGet<ComplaintData[]>("/api/complaints/mine");
}

export async function getAdminComplaints(params?: {
  reporterType?: "client" | "rider";
  status?: string;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.reporterType) search.set("reporterType", params.reporterType);
  if (params?.status) search.set("status", params.status);
  if (params?.limit != null) search.set("limit", String(params.limit));
  const q = search.toString();
  return apiGet<AdminComplaintData[]>(`/api/admin/complaints${q ? `?${q}` : ""}`);
}

export async function getAdminComplaintById(id: string) {
  return apiGet<AdminComplaintData>(`/api/admin/complaints/${encodeURIComponent(id)}`);
}

export async function updateAdminComplaintStatus(
  id: string,
  status: "open" | "in_review" | "resolved"
) {
  return apiPatch<AdminComplaintData>(`/api/admin/complaints/${encodeURIComponent(id)}/status`, {
    status,
  });
}

export function getReporterDisplayName(reporter: ComplaintReporter): string {
  const name = `${reporter.firstName} ${reporter.lastName}`.trim();
  return name || reporter.email || "—";
}

export function complaintStatusClass(status: string): string {
  const base = "inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize";
  switch (status) {
    case "open":
      return `${base} bg-amber-100 text-amber-800`;
    case "in_review":
      return `${base} bg-blue-100 text-blue-800`;
    case "resolved":
      return `${base} bg-green-100 text-green-800`;
    default:
      return `${base} bg-neutral-100 text-neutral-800`;
  }
}

export function reporterTypeClass(type: string): string {
  const base = "inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize";
  return type === "rider"
    ? `${base} bg-purple-100 text-purple-800`
    : `${base} bg-sky-100 text-sky-800`;
}

/** Dark / neon admin chips (matches `complaintStatusClass`). */
export function complaintStatusNeonClass(status: string): string {
  const base = "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize";
  switch (status) {
    case "open":
      return `${base} border-amber-400/45 bg-amber-500/15 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.2)]`;
    case "in_review":
      return `${base} border-sky-400/45 bg-sky-500/15 text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.22)]`;
    case "resolved":
      return `${base} border-emerald-400/50 bg-emerald-500/15 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.25)]`;
    default:
      return `${base} border-white/15 bg-white/10 text-white/80 shadow-[0_0_12px_rgba(255,255,255,0.06)]`;
  }
}

/** Dark / neon admin chips (matches `reporterTypeClass`). */
export function reporterTypeNeonClass(type: string): string {
  const base = "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize";
  return type === "rider"
    ? `${base} border-fuchsia-400/45 bg-fuchsia-500/15 text-fuchsia-100 shadow-[0_0_16px_rgba(232,121,249,0.22)]`
    : `${base} border-cyan-400/40 bg-cyan-500/15 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.2)]`;
}
