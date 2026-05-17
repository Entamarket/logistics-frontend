"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getRiderById, updateRiderStatus, getRiderDisplayName, getRiderUser, type RiderData } from "@/lib/riders-api";
import {
  getAdminRiderPerformance,
  formatAdminDate,
  shortShipmentId,
  type RiderPerformance,
} from "@/lib/admin-api";

const CHART_MONTHS = 12;
const THEME = "#81007f";
const THEME_DARK = "#5c005a";

function clientLabel(client: { firstName: string; lastName: string; email: string }): string {
  const name = `${client.firstName} ${client.lastName}`.trim();
  return name || client.email || "—";
}

export default function RiderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [rider, setRider] = useState<RiderData | null>(null);
  const [performance, setPerformance] = useState<RiderPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfLoading, setPerfLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPerfLoading(true);
      const [riderRes, perfRes] = await Promise.all([
        getRiderById(id),
        getAdminRiderPerformance(id, CHART_MONTHS),
      ]);
      if (cancelled) return;
      setLoading(false);
      setPerfLoading(false);
      if (riderRes.success && riderRes.data) setRider(riderRes.data);
      else setError(riderRes.message || "Rider not found");
      if (perfRes.success && perfRes.data) setPerformance(perfRes.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const chartMax = useMemo(() => {
    if (!performance?.monthly?.length) return 1;
    return Math.max(1, ...performance.monthly.map((m) => m.completedCount));
  }, [performance]);

  const totalInView = useMemo(() => {
    if (!performance?.monthly) return 0;
    return performance.monthly.reduce((a, m) => a + m.completedCount, 0);
  }, [performance]);

  async function handleSetStatus(newStatus: "active" | "suspended" | "blocked") {
    if (!rider) return;
    setActionLoading(true);
    const res = await updateRiderStatus(rider._id, newStatus);
    setActionLoading(false);
    if (res.success && res.data) setRider(res.data);
    else setError(res.message || "Failed to update status");
  }

  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (error && !rider) {
    return (
      <div>
        <Link href="/admin/riders" className="text-sm font-medium text-[#81007f] hover:underline">
          ← Back to riders
        </Link>
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!rider) return null;

  const user = getRiderUser(rider);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <Link href="/admin/riders" className="text-sm font-medium text-[#81007f] hover:underline">
          ← Back to riders
        </Link>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">{getRiderDisplayName(rider)}</h1>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <dt className="text-sm font-medium text-neutral-500">Email</dt>
          <dd className="mt-0.5 text-base text-neutral-900">{user?.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-neutral-500">Phone</dt>
          <dd className="mt-0.5 text-base text-neutral-900">{user?.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-neutral-500">Status</dt>
          <dd className="mt-0.5">
            <span
              className={
                rider.status === "active"
                  ? "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800"
                  : rider.status === "suspended"
                    ? "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800"
                    : rider.status === "blocked"
                      ? "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800"
                      : "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-800"
              }
            >
              {rider.status}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-neutral-500">Available</dt>
          <dd className="mt-0.5 text-base text-neutral-900">{rider.isAvailable ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-neutral-500">Total completed orders</dt>
          <dd className="mt-0.5 text-base font-semibold text-neutral-900">
            {perfLoading ? "…" : (performance?.totalCompleted ?? 0)}
          </dd>
        </div>
      </dl>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/riders/${rider._id}/edit`}
          className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg border-2 border-[#81007f] bg-white font-medium text-[#81007f] hover:bg-[#81007f] hover:text-white"
        >
          Edit rider
        </Link>
        {rider.status !== "active" && (
          <button
            type="button"
            onClick={() => handleSetStatus("active")}
            disabled={actionLoading}
            className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {actionLoading ? "Updating…" : "Activate rider"}
          </button>
        )}
        {rider.status !== "suspended" && (
          <button
            type="button"
            onClick={() => handleSetStatus("suspended")}
            disabled={actionLoading}
            className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {actionLoading ? "Updating…" : "Suspend rider"}
          </button>
        )}
        {rider.status !== "blocked" && (
          <button
            type="button"
            onClick={() => handleSetStatus("blocked")}
            disabled={actionLoading}
            className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {actionLoading ? "Updating…" : "Block rider"}
          </button>
        )}
      </div>

      <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Completed orders per month</h2>
            <p className="mt-1 text-xs text-neutral-500">Last {CHART_MONTHS} calendar months (delivered only).</p>
          </div>
          <p className="text-xs font-medium text-neutral-600 tabular-nums">
            In view: <span className="text-[#81007f]">{totalInView}</span> orders
          </p>
        </div>

        {perfLoading && <p className="mt-4 text-sm text-neutral-500">Loading performance…</p>}
        {!perfLoading && performance && (
          <div
            className="mt-6"
            role="img"
            aria-label={`Bar chart of completed orders per month. Total in range ${totalInView}.`}
          >
            <div className="flex h-56 items-end gap-1 sm:gap-1.5">
              {performance.monthly.map((m) => {
                const pct = chartMax > 0 ? (m.completedCount / chartMax) * 100 : 0;
                return (
                  <div key={m.yearMonth} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                    <span className="max-w-full truncate text-[10px] font-semibold tabular-nums text-neutral-800 sm:text-xs">
                      {m.completedCount > 0 ? m.completedCount : "—"}
                    </span>
                    <div className="flex h-44 w-full flex-col justify-end rounded-t-md bg-neutral-100/90">
                      <div
                        className="w-full min-h-0 rounded-t-md shadow-sm"
                        style={{
                          height: `${Math.max(pct, m.completedCount > 0 ? 8 : 0)}%`,
                          background: `linear-gradient(to top, ${THEME_DARK}, ${THEME})`,
                        }}
                        title={`${m.label}: ${m.completedCount} order(s)`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between gap-0.5 text-[9px] font-medium text-neutral-500 sm:text-[10px]">
              {performance.monthly.map((m) => (
                <span key={`lbl-${m.yearMonth}`} className="w-0 flex-1 truncate text-center" title={m.label}>
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#81007f] uppercase tracking-wide">Completed orders</h2>
        {perfLoading && <p className="text-sm text-neutral-500">Loading orders…</p>}
        {!perfLoading && (!performance || performance.orders.length === 0) && (
          <p className="text-sm text-neutral-500">No completed deliveries yet.</p>
        )}
        {!perfLoading && performance && performance.orders.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200 text-left">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase">Ref</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase hidden sm:table-cell">
                    Client
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase hidden md:table-cell">
                    Recipient
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase">Price</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase hidden sm:table-cell">
                    Delivered
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {performance.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm font-mono">#{shortShipmentId(order.id)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-900 hidden sm:table-cell">
                      {clientLabel(order.client)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                      {order.recipientName}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">₦{order.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell whitespace-nowrap">
                      {formatAdminDate(order.deliveredAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/shipments/${order.id}`}
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
      </section>
    </div>
  );
}
