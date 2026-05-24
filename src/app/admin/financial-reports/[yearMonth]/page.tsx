"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getAdminFinancialReportMonth,
  getClientDisplayName,
  getAdminRiderDisplayName,
  formatAdminDate,
  shortShipmentId,
  type MonthlyFinancialReportDetail,
} from "@/lib/admin-api";

const backLinkClass =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 shadow-[0_0_18px_rgba(232,121,249,0.12)] transition hover:border-fuchsia-400/35 hover:bg-fuchsia-500/10 hover:shadow-[0_0_24px_rgba(232,121,249,0.25)]";

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
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
      className={`relative overflow-hidden rounded-2xl border bg-white/5 px-4 py-4 backdrop-blur-sm ${ring}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{label}</p>
      <p className="mt-2 font-mono text-xl font-bold tabular-nums text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-white/40">{hint}</p>
    </div>
  );
}

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
      <div className="relative mx-auto max-w-6xl space-y-8 p-6 sm:p-8">{children}</div>
    </div>
  );
}

export default function AdminFinancialReportMonthPage() {
  const params = useParams();
  const router = useRouter();
  const yearMonth = params.yearMonth as string;
  const [report, setReport] = useState<MonthlyFinancialReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    const res = await getAdminFinancialReportMonth(yearMonth);
    setLoading(false);
    if (res.success && res.data) {
      setReport(res.data);
      return;
    }
    const msg = res.message || "Failed to load monthly report";
    if (msg.toLowerCase().includes("admin access") || msg.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(msg);
  }, [router, yearMonth]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <NeonShell>
        <div
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          role="status"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
          Loading deliveries…
        </div>
      </NeonShell>
    );
  }

  if (error && !report) {
    return (
      <NeonShell>
        <div className="space-y-6">
          <Link href="/admin/financial-reports" className={backLinkClass}>
            ← Financial reports
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

  if (!report) return null;

  return (
    <NeonShell>
      <div className="flex flex-col gap-6">
        <Link href="/admin/financial-reports" className={`${backLinkClass} w-fit`}>
          ← Financial reports
        </Link>

        <div className="min-w-0 space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-fuchsia-200/90">
            Monthly ledger
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(232,121,249,0.45)]">
              {report.label}
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/55">
            Delivered shipments counted in this calendar month. Revenue matches the financial reports ledger for{" "}
            <span className="font-mono text-fuchsia-200/80">{report.yearMonth}</span>.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Revenue" value={formatCurrency(report.revenue)} hint="Sum of delivery prices" accent="violet" />
          <StatCard
            label="Delivered"
            value={report.deliveredCount.toLocaleString()}
            hint="Completed shipments"
            accent="emerald"
          />
          <StatCard
            label="Avg order"
            value={report.deliveredCount > 0 ? formatCurrency(report.averageOrderValue) : "—"}
            hint="Revenue ÷ deliveries"
            accent="cyan"
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_-10px_rgba(129,0,127,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
          <div className="border-b border-white/10 px-4 py-4 sm:px-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/75">Deliveries</h2>
            <p className="mt-2 text-xs text-white/45">Sorted by delivery date, newest first.</p>
          </div>
          {report.deliveries.length === 0 ? (
            <p className="px-4 py-8 text-sm text-white/45 sm:px-6">No deliveries recorded for this month.</p>
          ) : (
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
                      Rider
                    </th>
                    <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 lg:table-cell">
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
                  {report.deliveries.map((d) => (
                    <tr
                      key={d.id}
                      className="transition-colors hover:bg-white/[0.06] hover:shadow-[inset_0_0_40px_rgba(129,0,127,0.08)]"
                    >
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 font-mono text-sm font-semibold text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.15)]">
                          #{shortShipmentId(d.id)}
                        </span>
                      </td>
                      <td className="hidden px-4 py-4 text-sm text-white/90 sm:table-cell">
                        {getClientDisplayName(d.client)}
                      </td>
                      <td className="hidden px-4 py-4 text-sm text-white/55 md:table-cell">
                        {d.rider ? getAdminRiderDisplayName(d.rider) : "—"}
                      </td>
                      <td className="hidden px-4 py-4 text-sm text-white/55 lg:table-cell">{d.recipientName}</td>
                      <td className="whitespace-nowrap px-4 py-4 font-mono text-sm font-semibold tabular-nums text-fuchsia-200">
                        {formatCurrency(d.price)}
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-white/50 sm:table-cell">
                        {formatAdminDate(d.deliveredAt)}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/shipments/${d.id}`}
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
          )}
        </section>
      </div>
    </NeonShell>
  );
}
