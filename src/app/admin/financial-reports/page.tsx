"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminFinancialReports, type FinancialReports } from "@/lib/admin-api";

const THEME = "#81007f";
const THEME_DARK = "#5c005a";

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

function formatPct(pct: number | null): string {
  if (pct === null) return "—";
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

function formatGeneratedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** Short label for narrow chart columns (full value in `title`). */
function abbrevRevenue(n: number): string {
  if (n <= 0) return "—";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n}`;
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: "violet" | "emerald" | "cyan" | "amber";
}) {
  const ring =
    accent === "violet"
      ? "shadow-[0_0_24px_rgba(168,85,247,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] border-fuchsia-500/40"
      : accent === "emerald"
        ? "shadow-[0_0_24px_rgba(52,211,153,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] border-emerald-400/35"
        : accent === "cyan"
          ? "shadow-[0_0_24px_rgba(34,211,238,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] border-cyan-400/35"
          : "shadow-[0_0_24px_rgba(251,191,36,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] border-amber-400/35";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white/5 px-4 py-4 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] ${ring}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{label}</p>
      <p className="mt-2 font-mono text-xl font-bold tabular-nums text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-white/40">{hint}</p>
    </div>
  );
}

const selectClass =
  "min-h-[48px] w-full cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:border-fuchsia-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 sm:min-w-[180px]";

const glassSection = "rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6";

export default function AdminFinancialReportsPage() {
  const router = useRouter();
  const [months, setMonths] = useState(12);
  const [report, setReport] = useState<FinancialReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    const res = await getAdminFinancialReports(months);
    setLoading(false);
    if (res.success && res.data) {
      setReport(res.data);
      return;
    }
    const msg = res.message || "Failed to load financial reports";
    if (msg.toLowerCase().includes("admin access") || msg.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(msg);
  }, [router, months]);

  useEffect(() => {
    load();
  }, [load]);

  const chartMax = useMemo(() => {
    if (!report?.monthly.length) return 1;
    return Math.max(1, ...report.monthly.map((m) => m.revenue));
  }, [report]);

  const tableRows = useMemo(() => {
    if (!report?.monthly) return [];
    return [...report.monthly].reverse();
  }, [report]);

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

      <div className="relative mx-auto max-w-6xl space-y-8 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-fuchsia-200/90 shadow-[0_0_20px_rgba(232,121,249,0.25)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_8px_#f0abfc]" />
              </span>
              Revenue
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(232,121,249,0.45)]">
                Financial reports
              </span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/55">
              Monthly revenue from delivered shipments. Each row is a calendar month; totals reflect the period you
              select below.
            </p>
            {report && (
              <p className="text-xs text-white/40">Generated {formatGeneratedAt(report.generatedAt)}</p>
            )}
          </div>
          <label className="flex w-full flex-col gap-1.5 lg:w-auto lg:shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
              Report period
            </span>
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className={selectClass}>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
              <option value={24}>Last 24 months</option>
              <option value={36}>Last 36 months</option>
            </select>
          </label>
        </div>

        {loading && (
          <div
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            role="status"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
            Loading financial reports…
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

        {!loading && !error && report && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Period revenue"
                value={formatCurrency(report.periodTotalRevenue)}
                hint={`Last ${report.monthCount} months`}
                accent="violet"
              />
              <StatCard
                label="Period deliveries"
                value={report.periodTotalDelivered.toLocaleString()}
                hint="Delivered shipments"
                accent="emerald"
              />
              <StatCard
                label="Avg monthly revenue"
                value={formatCurrency(report.periodAverageMonthlyRevenue)}
                hint="Across selected period"
                accent="cyan"
              />
              <StatCard
                label="All-time revenue"
                value={formatCurrency(report.allTimeRevenue)}
                hint={`${report.allTimeDeliveredCount.toLocaleString()} deliveries total`}
                accent="amber"
              />
            </div>

            <section className={glassSection}>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/75">
                Monthly revenue trend
              </h2>
              <p className="mt-2 text-xs text-white/45">Revenue from shipments marked delivered in each month.</p>
              <div
                className="mt-6"
                role="img"
                aria-label="Bar chart of monthly revenue for the selected period."
              >
                <div className="flex h-52 items-end gap-1 sm:gap-1.5">
                  {report.monthly.map((m) => {
                    const pct = chartMax > 0 ? (m.revenue / chartMax) * 100 : 0;
                    return (
                      <div key={m.yearMonth} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                        <span className="max-w-full truncate text-[10px] font-bold tabular-nums text-white/90 sm:text-xs">
                          {abbrevRevenue(m.revenue)}
                        </span>
                        <div className="flex h-44 w-full flex-col justify-end rounded-t-lg border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                          <div
                            className="w-full min-h-0 rounded-t-lg shadow-[0_0_20px_rgba(192,38,211,0.35)]"
                            style={{
                              height: `${Math.max(pct, m.revenue > 0 ? 8 : 0)}%`,
                              background: `linear-gradient(to top, ${THEME_DARK}, ${THEME})`,
                            }}
                            title={`${m.label}: ${formatCurrency(m.revenue)}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between gap-0.5 text-[9px] font-medium text-white/40 sm:text-[10px]">
                  {report.monthly.map((m) => (
                    <span key={`lbl-${m.yearMonth}`} className="w-0 flex-1 truncate text-center" title={m.label}>
                      {m.label.split(" ")[0]}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_-10px_rgba(129,0,127,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
              <div className="border-b border-white/10 px-4 py-4 sm:px-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/75">
                  Monthly report ledger
                </h2>
                <p className="mt-2 text-xs text-white/45">
                  Newest months first. Revenue is the sum of shipment prices completed in that month.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        Month
                      </th>
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        Delivered
                      </th>
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        Revenue
                      </th>
                      <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 sm:table-cell">
                        Avg order
                      </th>
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        vs prev month
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableRows.map((row) => (
                      <tr
                        key={row.yearMonth}
                        className="transition-colors hover:bg-white/[0.06] hover:shadow-[inset_0_0_40px_rgba(129,0,127,0.08)]"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-white/95">{row.label}</td>
                        <td className="px-4 py-4 font-mono text-sm tabular-nums text-white/70">
                          {row.deliveredCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 font-mono text-sm font-semibold tabular-nums text-fuchsia-200 drop-shadow-[0_0_8px_rgba(232,121,249,0.25)]">
                          {formatCurrency(row.revenue)}
                        </td>
                        <td className="hidden px-4 py-4 font-mono text-sm tabular-nums text-white/60 sm:table-cell">
                          {row.deliveredCount > 0 ? formatCurrency(row.averageOrderValue) : "—"}
                        </td>
                        <td className="px-4 py-4 font-mono text-sm tabular-nums">
                          {row.changeFromPreviousPct === null ? (
                            <span className="text-white/35">—</span>
                          ) : (
                            <span
                              className={
                                row.changeFromPreviousPct >= 0
                                  ? "font-semibold text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]"
                                  : "font-semibold text-red-300 drop-shadow-[0_0_8px_rgba(248,113,113,0.25)]"
                              }
                            >
                              {formatPct(row.changeFromPreviousPct)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/15 bg-white/[0.06]">
                      <td className="px-4 py-4 text-sm font-bold text-white">Period total</td>
                      <td className="px-4 py-4 font-mono text-sm font-bold tabular-nums text-white">
                        {report.periodTotalDelivered.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-bold tabular-nums text-fuchsia-200 drop-shadow-[0_0_10px_rgba(232,121,249,0.35)]">
                        {formatCurrency(report.periodTotalRevenue)}
                      </td>
                      <td className="hidden sm:table-cell" />
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
