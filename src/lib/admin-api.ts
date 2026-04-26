import { apiGet } from "./api";

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
