"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAdminShipments,
  getClientDisplayName,
  getAdminRiderDisplayName,
  formatAdminDate,
  shipmentStatusClass,
  shortShipmentId,
  type AdminShipmentListItem,
} from "@/lib/admin-api";

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "Scheduled" },
  { value: "searching_rider", label: "Searching rider" },
  { value: "awaiting_rider_response", label: "Awaiting rider" },
  { value: "rider_assigned", label: "Rider assigned" },
  { value: "picked_up", label: "Picked up" },
  { value: "in_transit", label: "In transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function AdminShipmentsList() {
  const router = useRouter();
  const [shipments, setShipments] = useState<AdminShipmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    const res = await getAdminShipments({
      status: statusFilter || undefined,
      limit: 200,
    });
    setLoading(false);
    if (res.success && res.data) {
      setShipments(res.data);
      return;
    }
    const msg = res.message || "Failed to load shipments";
    if (msg.toLowerCase().includes("admin access") || msg.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(msg);
  }, [router, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <label className="flex items-center gap-2 text-sm text-neutral-600 sm:max-w-xs w-full">
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full min-h-[44px] rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#81007f]"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading shipments…</p>}
      {error && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      {!loading && !error && shipments.length === 0 && (
        <p className="text-sm text-neutral-500">No shipments found.</p>
      )}
      {!loading && !error && shipments.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-left">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Ref
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider hidden md:table-cell">
                  Rider
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider hidden sm:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-mono text-neutral-900">
                    #{shortShipmentId(s.id)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={shipmentStatusClass(s.status)}>
                      {s.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-neutral-900">
                      {getClientDisplayName(s.client)}
                    </div>
                    <div className="text-xs text-neutral-500 hidden sm:block">{s.client.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                    {s.rider ? (
                      <span title={s.assignmentLabel}>{getAdminRiderDisplayName(s.rider)}</span>
                    ) : (
                      <span className="text-neutral-500">{s.assignmentLabel}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell whitespace-nowrap">
                    {formatAdminDate(s.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900 whitespace-nowrap">
                    ₦{s.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/shipments/${s.id}`}
                      className="text-sm font-medium text-[#81007f] hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
