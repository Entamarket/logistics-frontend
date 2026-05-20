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

const backLinkClass =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 shadow-[0_0_18px_rgba(232,121,249,0.12)] transition hover:border-fuchsia-400/35 hover:bg-fuchsia-500/10 hover:shadow-[0_0_24px_rgba(232,121,249,0.25)]";

const glassCard = "rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6";

function NeonShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-fuchsia-500/25 bg-gradient-to-br from-slate-950 via-[#1a0a24] to-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_80px_-20px_rgba(192,38,211,0.55),0_32px_64px_-24px_rgba(0,0,0,0.65)]">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-fuchsia-600/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-violet-600/20 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(129,0,127,0.12)_0%,transparent_55%)]"
        aria-hidden
      />
      <div className="relative p-6 sm:p-8">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-white/95 sm:text-base">{value}</dd>
    </div>
  );
}

function riderAccountStatusNeonClass(status: string): string {
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
    if (res.success && res.data) {
      setRider(res.data);
      setError("");
    } else setError(res.message || "Failed to update status");
  }

  if (loading) {
    return (
      <NeonShell>
        <div
          className="flex max-w-4xl items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          role="status"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
          Loading rider…
        </div>
      </NeonShell>
    );
  }

  if (error && !rider) {
    return (
      <NeonShell>
        <div className="max-w-4xl space-y-6">
          <Link href="/admin/riders" className={backLinkClass}>
            ← Back to riders
          </Link>
          <div
            className="rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-4 text-sm text-red-100 shadow-[0_0_28px_rgba(248,113,113,0.25)]"
            role="alert"
          >
            {error}
          </div>
        </div>
      </NeonShell>
    );
  }

  if (!rider) return null;

  const user = getRiderUser(rider);
  const initial = getRiderDisplayName(rider).charAt(0).toUpperCase();

  return (
    <NeonShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <Link href="/admin/riders" className={`${backLinkClass} w-fit shrink-0`}>
            ← Back to riders
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/30 to-violet-600/25 text-xl font-bold text-fuchsia-100 shadow-[0_0_28px_rgba(192,38,211,0.45)]">
              {initial}
            </span>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(232,121,249,0.4)]">
                  {getRiderDisplayName(rider)}
                </span>
              </h1>
              <p className="break-all font-mono text-xs text-white/40">{rider._id}</p>
            </div>
          </div>
        </div>

        <div className={`${glassCard}`}>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow label="Email" value={user?.email ?? "—"} />
            <DetailRow label="Phone" value={<span className="font-mono text-white/85">{user?.phone ?? "—"}</span>} />
            <DetailRow
              label="Status"
              value={<span className={riderAccountStatusNeonClass(rider.status)}>{rider.status}</span>}
            />
            <DetailRow
              label="Available"
              value={
                <span
                  className={
                    rider.isAvailable
                      ? "font-semibold text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)]"
                      : "text-white/45"
                  }
                >
                  {rider.isAvailable ? "Yes" : "No"}
                </span>
              }
            />
            <DetailRow
              label="Verified"
              value={
                rider.isVerified ? (
                  <span className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                    Verified
                  </span>
                ) : (
                  <span className="text-white/45">—</span>
                )
              }
            />
            <DetailRow
              label="Total completed orders"
              value={
                <span className="font-mono text-lg font-bold tabular-nums text-white">
                  {perfLoading ? "…" : (performance?.totalCompleted ?? 0)}
                </span>
              }
            />
          </dl>
        </div>

        {error && rider && (
          <div
            className="rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.2)]"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/riders/${rider._id}/edit`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-5 text-sm font-semibold text-fuchsia-100 shadow-[0_0_18px_rgba(232,121,249,0.15)] transition hover:border-fuchsia-300/55 hover:bg-fuchsia-500/20 hover:shadow-[0_0_26px_rgba(232,121,249,0.35)]"
          >
            Edit rider
          </Link>
          {rider.status !== "active" && (
            <button
              type="button"
              onClick={() => handleSetStatus("active")}
              disabled={actionLoading}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-600/25 px-5 text-sm font-semibold text-emerald-100 shadow-[0_0_22px_rgba(52,211,153,0.25)] transition hover:bg-emerald-600/35 disabled:opacity-50"
            >
              {actionLoading ? "Updating…" : "Activate rider"}
            </button>
          )}
          {rider.status !== "suspended" && (
            <button
              type="button"
              onClick={() => handleSetStatus("suspended")}
              disabled={actionLoading}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-400/45 bg-amber-600/25 px-5 text-sm font-semibold text-amber-100 shadow-[0_0_22px_rgba(251,191,36,0.2)] transition hover:bg-amber-600/35 disabled:opacity-50"
            >
              {actionLoading ? "Updating…" : "Suspend rider"}
            </button>
          )}
          {rider.status !== "blocked" && (
            <button
              type="button"
              onClick={() => handleSetStatus("blocked")}
              disabled={actionLoading}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-400/45 bg-red-600/25 px-5 text-sm font-semibold text-red-100 shadow-[0_0_22px_rgba(248,113,113,0.22)] transition hover:bg-red-600/35 disabled:opacity-50"
            >
              {actionLoading ? "Updating…" : "Block rider"}
            </button>
          )}
        </div>

        <section className={glassCard}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/75">
                Completed orders per month
              </h2>
              <p className="mt-2 text-xs text-white/45">Last {CHART_MONTHS} calendar months (delivered only).</p>
            </div>
            <p className="text-xs font-semibold tabular-nums text-white/60">
              In view:{" "}
              <span className="text-fuchsia-200 drop-shadow-[0_0_8px_rgba(232,121,249,0.4)]">{totalInView}</span>{" "}
              orders
            </p>
          </div>

          {perfLoading && (
            <div className="mt-6 flex items-center gap-2 text-sm text-white/55">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
              Loading performance…
            </div>
          )}
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
                      <span className="max-w-full truncate text-[10px] font-bold tabular-nums text-white/90 sm:text-xs">
                        {m.completedCount > 0 ? m.completedCount : "—"}
                      </span>
                      <div className="flex h-44 w-full flex-col justify-end rounded-t-lg border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <div
                          className="w-full min-h-0 rounded-t-lg shadow-[0_0_20px_rgba(192,38,211,0.35)]"
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
              <div className="mt-2 flex justify-between gap-0.5 text-[9px] font-medium text-white/40 sm:text-[10px]">
                {performance.monthly.map((m) => (
                  <span key={`lbl-${m.yearMonth}`} className="w-0 flex-1 truncate text-center" title={m.label}>
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/75">Completed orders</h2>
          {perfLoading && (
            <div className="flex items-center gap-2 text-sm text-white/55">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
              Loading orders…
            </div>
          )}
          {!perfLoading && (!performance || performance.orders.length === 0) && (
            <p className="text-sm text-white/45">No completed deliveries yet.</p>
          )}
          {!perfLoading && performance && performance.orders.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_-10px_rgba(129,0,127,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        Ref
                      </th>
                      <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 sm:table-cell">
                        Client
                      </th>
                      <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 md:table-cell">
                        Recipient
                      </th>
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        Price
                      </th>
                      <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 sm:table-cell">
                        Delivered
                      </th>
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {performance.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-white/[0.06] hover:shadow-[inset_0_0_40px_rgba(129,0,127,0.08)]"
                      >
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 font-mono text-sm font-semibold text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.15)]">
                            #{shortShipmentId(order.id)}
                          </span>
                        </td>
                        <td className="hidden px-4 py-4 text-sm text-white/90 sm:table-cell">{clientLabel(order.client)}</td>
                        <td className="hidden px-4 py-4 text-sm text-white/55 md:table-cell">{order.recipientName}</td>
                        <td className="whitespace-nowrap px-4 py-4 font-mono text-sm text-white/90">
                          ₦{order.price.toLocaleString()}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-white/50 sm:table-cell">
                          {formatAdminDate(order.deliveredAt)}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/shipments/${order.id}`}
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
        </section>
      </div>
    </NeonShell>
  );
}
