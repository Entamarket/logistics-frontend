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
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Financial reports</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Monthly revenue from delivered shipments. Each row is a calendar month report.
          </p>
          {report && (
            <p className="mt-1 text-xs text-neutral-500">
              Generated {formatGeneratedAt(report.generatedAt)}
            </p>
          )}
        </div>
        <label className="flex flex-col gap-1 text-sm text-neutral-600 sm:min-w-[160px]">
          <span className="font-medium text-neutral-900">Report period</span>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="min-h-[44px] rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#81007f]"
          >
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
            <option value={36}>Last 36 months</option>
          </select>
        </label>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading financial reports…</p>}
      {error && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Period revenue</p>
              <p className="mt-2 text-xl font-bold text-[#81007f] tabular-nums">
                {formatCurrency(report.periodTotalRevenue)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">Last {report.monthCount} months</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Period deliveries</p>
              <p className="mt-2 text-xl font-bold text-neutral-900 tabular-nums">
                {report.periodTotalDelivered.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-neutral-500">Delivered shipments</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Avg monthly revenue</p>
              <p className="mt-2 text-xl font-bold text-neutral-900 tabular-nums">
                {formatCurrency(report.periodAverageMonthlyRevenue)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">Across selected period</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">All-time revenue</p>
              <p className="mt-2 text-xl font-bold text-neutral-900 tabular-nums">
                {formatCurrency(report.allTimeRevenue)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {report.allTimeDeliveredCount.toLocaleString()} deliveries total
              </p>
            </div>
          </div>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">Monthly revenue trend</h2>
            <p className="mt-1 text-xs text-neutral-500">Revenue from shipments marked delivered in each month.</p>
            <div className="mt-6 flex h-48 items-end gap-1 sm:gap-1.5">
              {report.monthly.map((m) => {
                const pct = chartMax > 0 ? (m.revenue / chartMax) * 100 : 0;
                return (
                  <div key={m.yearMonth} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                    <div className="flex h-40 w-full flex-col justify-end rounded-t-md bg-neutral-100/90">
                      <div
                        className="w-full min-h-0 rounded-t-md"
                        style={{
                          height: `${Math.max(pct, m.revenue > 0 ? 8 : 0)}%`,
                          background: `linear-gradient(to top, ${THEME_DARK}, ${THEME})`,
                        }}
                        title={`${m.label}: ${formatCurrency(m.revenue)}`}
                      />
                    </div>
                    <span className="max-w-full truncate text-[9px] text-neutral-500 sm:text-[10px]" title={m.label}>
                      {m.label.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-4 sm:px-6 border-b border-neutral-200">
              <h2 className="text-base font-semibold text-neutral-900">Monthly report ledger</h2>
              <p className="mt-1 text-xs text-neutral-500">
                Newest months first. Revenue is the sum of shipment prices completed in that month.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-left">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Delivered
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider hidden sm:table-cell">
                      Avg order
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      vs prev month
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {tableRows.map((row) => (
                    <tr key={row.yearMonth} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm font-medium text-neutral-900">{row.label}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700 tabular-nums">
                        {row.deliveredCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#81007f] tabular-nums">
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700 tabular-nums hidden sm:table-cell">
                        {row.deliveredCount > 0 ? formatCurrency(row.averageOrderValue) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums">
                        {row.changeFromPreviousPct === null ? (
                          <span className="text-neutral-400">—</span>
                        ) : (
                          <span
                            className={
                              row.changeFromPreviousPct >= 0 ? "text-emerald-700" : "text-red-700"
                            }
                          >
                            {formatPct(row.changeFromPreviousPct)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-neutral-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-900">Period total</td>
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-900 tabular-nums">
                      {report.periodTotalDelivered.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#81007f] tabular-nums">
                      {formatCurrency(report.periodTotalRevenue)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell" />
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
