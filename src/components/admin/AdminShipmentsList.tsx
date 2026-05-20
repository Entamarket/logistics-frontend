"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAdminShipments,
  getClientDisplayName,
  getAdminRiderDisplayName,
  formatAdminDate,
  shipmentStatusNeonClass,
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

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint: string;
  accent: "violet" | "emerald" | "cyan";
}) {
  const ring =
    accent === "violet"
      ? "shadow-[0_0_24px_rgba(168,85,247,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] border-fuchsia-500/40"
      : accent === "emerald"
        ? "shadow-[0_0_24px_rgba(52,211,153,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] border-emerald-400/35"
        : "shadow-[0_0_24px_rgba(34,211,238,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] border-cyan-400/35";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white/5 px-4 py-4 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] ${ring}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
        {value}
      </p>
      <p className="mt-1 text-xs text-white/40">{hint}</p>
    </div>
  );
}

const selectFilterClass =
  "w-full min-h-[44px] cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:border-fuchsia-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30";

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

  const stats = useMemo(() => {
    const total = shipments.length;
    const delivered = shipments.filter((s) => s.status === "delivered").length;
    const pipeline = shipments.filter((s) => s.status !== "delivered" && s.status !== "cancelled").length;
    return { total, delivered, pipeline };
  }, [shipments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="block w-full text-sm text-white/60 sm:max-w-xs">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
            Filter by status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectFilterClass}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!loading && !error && shipments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="In view" value={stats.total} hint="Matches current filter" accent="violet" />
          <StatCard label="Delivered" value={stats.delivered} hint="Completed in list" accent="emerald" />
          <StatCard label="Pipeline" value={stats.pipeline} hint="Excl. delivered & cancelled" accent="cyan" />
        </div>
      )}

      {loading && (
        <div
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          role="status"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
          Loading shipments…
        </div>
      )}

      {error && (
        <div
          className="rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-4 text-sm text-red-100 shadow-[0_0_28px_rgba(248,113,113,0.25)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && shipments.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <p className="text-lg font-semibold text-white/90">No shipments found</p>
          <p className="mt-2 text-sm text-white/45">Try another status filter or create a batch from the other tab.</p>
        </div>
      )}

      {!loading && !error && shipments.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_-10px_rgba(129,0,127,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04]">
                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                    Ref
                  </th>
                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                    Status
                  </th>
                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                    Client
                  </th>
                  <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 md:table-cell">
                    Rider
                  </th>
                  <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 sm:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                    Price
                  </th>
                  <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {shipments.map((s) => (
                  <tr
                    key={s.id}
                    className="group transition-colors hover:bg-white/[0.06] hover:shadow-[inset_0_0_40px_rgba(129,0,127,0.08)]"
                  >
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 font-mono text-sm font-semibold text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.15)]">
                        #{shortShipmentId(s.id)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={shipmentStatusNeonClass(s.status)}>{s.status.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-white/95">{getClientDisplayName(s.client)}</div>
                      <div className="hidden text-xs text-white/40 sm:block">{s.client.email}</div>
                    </td>
                    <td className="hidden px-4 py-4 text-sm text-white/65 md:table-cell">
                      {s.rider ? (
                        <span title={s.assignmentLabel}>{getAdminRiderDisplayName(s.rider)}</span>
                      ) : (
                        <span className="text-white/35">{s.assignmentLabel}</span>
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-white/50 sm:table-cell">
                      {formatAdminDate(s.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-mono text-sm font-medium text-white/90">
                      ₦{s.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/shipments/${s.id}`}
                        className="inline-block rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-100 shadow-[0_0_14px_rgba(232,121,249,0.15)] transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/20 hover:shadow-[0_0_20px_rgba(232,121,249,0.35)]"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
