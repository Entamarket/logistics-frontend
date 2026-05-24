import { apiGet, apiPatch, apiPost } from "./api";

export interface MonthlyRevenue {
  yearMonth: string;
  label: string;
  amount: number;
}

export interface RevenueSummary {
  currency: "NGN";
  totalEarned: number;
  deliveredCount: number;
  activeShipmentCount: number;
  availableRidersCount: number;
  monthly: MonthlyRevenue[];
}

export async function getAdminRevenueSummary(months = 12) {
  const q = months !== 12 ? `?months=${encodeURIComponent(String(months))}` : "";
  return apiGet<RevenueSummary>(`/api/admin/revenue${q}`);
}

export interface MonthlyFinancialReport {
  yearMonth: string;
  label: string;
  revenue: number;
  deliveredCount: number;
  averageOrderValue: number;
  changeFromPreviousPct: number | null;
}

export interface FinancialReports {
  currency: "NGN";
  generatedAt: string;
  monthCount: number;
  year?: number;
  availableYears: number[];
  allTimeRevenue: number;
  allTimeDeliveredCount: number;
  periodTotalRevenue: number;
  periodTotalDelivered: number;
  periodAverageMonthlyRevenue: number;
  monthly: MonthlyFinancialReport[];
}

export async function getAdminFinancialReports(params?: { year?: number; months?: number }) {
  const search = new URLSearchParams();
  if (params?.year != null) {
    search.set("year", String(params.year));
  } else if (params?.months != null && params.months !== 12) {
    search.set("months", String(params.months));
  }
  const q = search.toString();
  return apiGet<FinancialReports>(`/api/admin/financial-reports${q ? `?${q}` : ""}`);
}

export interface MonthlyFinancialDelivery {
  id: string;
  price: number;
  paymentStatus: string;
  deliveryType: string;
  deliveredAt: string;
  createdAt: string;
  senderName: string;
  recipientName: string;
  client: { id: string; firstName: string; lastName: string; email: string };
  rider: AdminShipmentRider | null;
}

export interface MonthlyFinancialReportDetail {
  yearMonth: string;
  label: string;
  revenue: number;
  deliveredCount: number;
  averageOrderValue: number;
  deliveries: MonthlyFinancialDelivery[];
}

export async function getAdminFinancialReportMonth(yearMonth: string) {
  return apiGet<MonthlyFinancialReportDetail>(
    `/api/admin/financial-reports/${encodeURIComponent(yearMonth)}`
  );
}

export interface AdminClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AdminShipmentRider {
  riderId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AdminShipmentListItem {
  id: string;
  status: string;
  deliveryType: string;
  price: number;
  paymentStatus: string;
  createdAt: string;
  client: AdminClient;
  rider: AdminShipmentRider | null;
  assignmentLabel: string;
}

export interface AdminShipmentDetail extends AdminShipmentListItem {
  senderDetails: { fullName: string; address: string; phone: string };
  recipientDetails: { fullName: string; address: string; phone: string };
  packageDetails: {
    type: string;
    weight: number;
    dimensions: number;
    quantity: number;
    note?: string;
  };
  timeline: { status: string; timestamp: string }[];
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  pickupLongitude?: number;
  pickupLatitude?: number;
  recipientLongitude?: number;
  recipientLatitude?: number;
  riderResponseDeadline?: string;
  declinedRiderCount: number;
  updatedAt: string;
}

export function getClientDisplayName(client: Pick<AdminClient, "firstName" | "lastName" | "email">): string {
  const name = `${client.firstName} ${client.lastName}`.trim();
  return name || client.email || "—";
}

export function getAdminRiderDisplayName(rider: AdminShipmentRider): string {
  const name = `${rider.firstName} ${rider.lastName}`.trim();
  return name || rider.email || "—";
}

export function formatAdminDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function shipmentStatusClass(status: string): string {
  const base = "inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize";
  switch (status) {
    case "delivered":
      return `${base} bg-green-100 text-green-800`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
    case "searching_rider":
      return `${base} bg-blue-100 text-blue-800`;
    case "awaiting_rider_response":
      return `${base} bg-purple-100 text-purple-800`;
    case "scheduled":
    case "pending":
      return `${base} bg-amber-100 text-amber-800`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800`;
    default:
      return `${base} bg-neutral-100 text-neutral-800`;
  }
}

/** Dark / neon admin table chips (matches `shipmentStatusClass` groupings). */
export function shipmentStatusNeonClass(status: string): string {
  const base =
    "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize";
  switch (status) {
    case "delivered":
      return `${base} border-emerald-400/50 bg-emerald-500/15 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.25)]`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
    case "searching_rider":
      return `${base} border-sky-400/45 bg-sky-500/15 text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.22)]`;
    case "awaiting_rider_response":
      return `${base} border-fuchsia-400/45 bg-fuchsia-500/15 text-fuchsia-100 shadow-[0_0_16px_rgba(232,121,249,0.22)]`;
    case "scheduled":
    case "pending":
      return `${base} border-amber-400/45 bg-amber-500/15 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.2)]`;
    case "cancelled":
      return `${base} border-red-400/50 bg-red-500/15 text-red-100 shadow-[0_0_16px_rgba(248,113,113,0.22)]`;
    default:
      return `${base} border-white/15 bg-white/10 text-white/80 shadow-[0_0_12px_rgba(255,255,255,0.06)]`;
  }
}

export function shortShipmentId(id: string): string {
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

export async function getAdminShipments(params?: { status?: string; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.limit != null) search.set("limit", String(params.limit));
  const q = search.toString();
  return apiGet<AdminShipmentListItem[]>(`/api/admin/shipments${q ? `?${q}` : ""}`);
}

export async function getAdminShipmentById(id: string) {
  return apiGet<AdminShipmentDetail>(`/api/admin/shipments/${encodeURIComponent(id)}`);
}

const ADMIN_ASSIGNABLE_STATUSES = new Set([
  "pending",
  "scheduled",
  "searching_rider",
  "awaiting_rider_response",
]);

export function canAdminAssignShipment(status: string): boolean {
  return ADMIN_ASSIGNABLE_STATUSES.has(status);
}

export async function getAdminAvailableRiders() {
  return apiGet<AdminShipmentRider[]>("/api/admin/available-riders");
}

export async function assignAdminShipmentToRider(shipmentId: string, riderId: string) {
  return apiPatch<AdminShipmentDetail>(
    `/api/admin/shipments/${encodeURIComponent(shipmentId)}/assign`,
    { riderId }
  );
}

export interface AdminBulkShipmentItemPayload {
  deliveryType: "instant" | "scheduled";
  senderDetails: { fullName: string; address: string; phone: string };
  recipientDetails: { fullName: string; address: string; phone: string };
  packageDetails: {
    type: string;
    weight: number;
    dimensions: number;
    quantity: number;
    note?: string;
  };
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  pickupLongitude?: number;
  pickupLatitude?: number;
  recipientLongitude?: number;
  recipientLatitude?: number;
  riderId?: string;
}

export interface AdminBulkShipmentResult {
  index: number;
  success: boolean;
  shipmentId?: string;
  error?: string;
}

export async function createAdminShipmentsBulk(payload: {
  clientId: string;
  defaultRiderId: string;
  shipments: AdminBulkShipmentItemPayload[];
}) {
  return apiPost<{ results: AdminBulkShipmentResult[] }>("/api/admin/shipments/bulk", payload);
}

export type ClientAccountStatus = "active" | "suspended" | "blocked";

export interface AdminClientListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ClientAccountStatus;
  isEmailVerified: boolean;
  createdAt: string;
  shipmentCount: number;
}

export interface AdminClientStats {
  totalShipments: number;
  activeShipments: number;
  deliveredCount: number;
  totalSpent: number;
}

export interface AdminClientDetail extends AdminClientListItem {
  stats: AdminClientStats;
}

export interface AdminClientActivityShipment {
  id: string;
  status: string;
  deliveryType: string;
  price: number;
  paymentStatus: string;
  createdAt: string;
  recipientName: string;
}

export interface AdminClientActivityFeedback {
  id: string;
  shipmentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminClientActivity {
  shipments: AdminClientActivityShipment[];
  feedback: AdminClientActivityFeedback[];
}

export function getAdminClientDisplayName(client: Pick<AdminClientListItem, "firstName" | "lastName" | "email">): string {
  const name = `${client.firstName} ${client.lastName}`.trim();
  return name || client.email || "—";
}

export function clientStatusClass(status: string): string {
  const base = "inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize";
  switch (status) {
    case "active":
      return `${base} bg-green-100 text-green-800`;
    case "suspended":
      return `${base} bg-amber-100 text-amber-800`;
    case "blocked":
      return `${base} bg-red-100 text-red-800`;
    default:
      return `${base} bg-neutral-100 text-neutral-800`;
  }
}

/** Dark / neon admin table chips (matches `clientStatusClass`). */
export function clientStatusNeonClass(status: string): string {
  const base = "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize";
  switch (status) {
    case "active":
      return `${base} border-emerald-400/50 bg-emerald-500/15 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.25)]`;
    case "suspended":
      return `${base} border-amber-400/45 bg-amber-500/15 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.2)]`;
    case "blocked":
      return `${base} border-red-400/50 bg-red-500/15 text-red-100 shadow-[0_0_16px_rgba(248,113,113,0.22)]`;
    default:
      return `${base} border-white/15 bg-white/10 text-white/80 shadow-[0_0_12px_rgba(255,255,255,0.06)]`;
  }
}

export async function getAdminClients(params?: { q?: string; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.limit != null) search.set("limit", String(params.limit));
  const q = search.toString();
  return apiGet<AdminClientListItem[]>(`/api/admin/clients${q ? `?${q}` : ""}`);
}

export async function getAdminClientById(id: string) {
  return apiGet<AdminClientDetail>(`/api/admin/clients/${encodeURIComponent(id)}`);
}

export async function getAdminClientActivity(id: string) {
  return apiGet<AdminClientActivity>(`/api/admin/clients/${encodeURIComponent(id)}/activity`);
}

export async function updateAdminClientStatus(id: string, status: ClientAccountStatus) {
  return apiPatch<AdminClientDetail>(`/api/admin/clients/${encodeURIComponent(id)}/status`, { status });
}

export interface RiderMonthlyPerformance {
  yearMonth: string;
  label: string;
  completedCount: number;
}

export interface RiderCompletedOrder {
  id: string;
  status: string;
  deliveryType: string;
  price: number;
  paymentStatus: string;
  deliveredAt: string;
  createdAt: string;
  senderName: string;
  recipientName: string;
  client: { id: string; firstName: string; lastName: string; email: string };
}

export interface RiderPerformance {
  riderId: string;
  totalCompleted: number;
  monthly: RiderMonthlyPerformance[];
  orders: RiderCompletedOrder[];
}

export async function getAdminRiderPerformance(riderId: string, months = 12) {
  const q = months !== 12 ? `?months=${encodeURIComponent(String(months))}` : "";
  return apiGet<RiderPerformance>(`/api/admin/riders/${encodeURIComponent(riderId)}/performance${q}`);
}
