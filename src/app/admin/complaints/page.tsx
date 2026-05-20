"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAdminDate, shortShipmentId } from "@/lib/admin-api";
import {
  getAdminComplaints,
  getReporterDisplayName,
  complaintStatusNeonClass,
  reporterTypeNeonClass,
  type AdminComplaintData,
} from "@/lib/complaints-api";

type ReporterFilter = "" | "client" | "rider";
type StatusFilter = "" | "open" | "in_review" | "resolved";

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
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
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
        {value}
      </p>
      <p className="mt-1 text-xs text-white/40">{hint}</p>
    </div>
  );
}

const selectClass =
  "w-full min-h-[44px] cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:border-fuchsia-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30";

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<AdminComplaintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reporterType, setReporterType] = useState<ReporterFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    const res = await getAdminComplaints({
      reporterType: reporterType || undefined,
      status: status || undefined,
      limit: 200,
    });
    setLoading(false);
    if (res.success && res.data) {
      setComplaints(res.data);
      return;
    }
    const msg = res.message || "Failed to load complaints";
    if (msg.toLowerCase().includes("admin access") || msg.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(msg);
  }, [router, reporterType, status]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((c) => c.status === "open").length;
    const inReview = complaints.filter((c) => c.status === "in_review").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    return { total, open, inReview, resolved };
  }, [complaints]);

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

      <div className="relative space-y-8 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-fuchsia-200/90 shadow-[0_0_20px_rgba(232,121,249,0.25)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_8px_#f0abfc]" />
              </span>
              Support
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(232,121,249,0.45)]">
                Complaints
              </span>
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/55">
              Complaints from clients and riders. Filter by reporter type or pipeline status.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-md lg:shrink-0">
            <label className="block flex-1">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                Reporter
              </span>
              <select
                value={reporterType}
                onChange={(e) => setReporterType(e.target.value as ReporterFilter)}
                className={selectClass}
              >
                <option value="">All reporters</option>
                <option value="client">Client</option>
                <option value="rider">Rider</option>
              </select>
            </label>
            <label className="block flex-1">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                className={selectClass}
              >
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="in_review">In review</option>
                <option value="resolved">Resolved</option>
              </select>
            </label>
          </div>
        </div>

        {!loading && !error && complaints.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="In view" value={stats.total} hint="Matches filters" accent="violet" />
            <StatCard label="Open" value={stats.open} hint="Needs attention" accent="amber" />
            <StatCard label="In review" value={stats.inReview} hint="Being handled" accent="cyan" />
            <StatCard label="Resolved" value={stats.resolved} hint="Closed in list" accent="emerald" />
          </div>
        )}

        {loading && (
          <div
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            role="status"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
            Loading complaints…
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

        {!loading && !error && complaints.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-lg font-semibold text-white/90">No complaints match</p>
            <p className="mt-2 text-sm text-white/45">Try different filters or check back later.</p>
          </div>
        )}

        {!loading && !error && complaints.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_-10px_rgba(129,0,127,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04]">
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Subject
                    </th>
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Reporter
                    </th>
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Type
                    </th>
                    <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 md:table-cell">
                      Shipment
                    </th>
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Status
                    </th>
                    <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 sm:table-cell">
                      Submitted
                    </th>
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {complaints.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-white/[0.06] hover:shadow-[inset_0_0_40px_rgba(129,0,127,0.08)]"
                    >
                      <td className="max-w-[220px] truncate px-4 py-4 text-sm font-medium text-white/95">
                        {c.subject}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">{getReporterDisplayName(c.reporter)}</td>
                      <td className="px-4 py-4">
                        <span className={reporterTypeNeonClass(c.reporterType)}>{c.reporterType}</span>
                      </td>
                      <td className="hidden px-4 py-4 text-sm md:table-cell">
                        {c.relatedShipmentId ? (
                          <Link
                            href={`/admin/shipments/${c.relatedShipmentId}`}
                            className="inline-flex items-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 font-mono text-xs font-semibold text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.15)] transition hover:border-cyan-300/50 hover:bg-cyan-500/20"
                          >
                            #{shortShipmentId(c.relatedShipmentId)}
                          </Link>
                        ) : (
                          <span className="text-white/35">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={complaintStatusNeonClass(c.status)}>{c.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-white/50 sm:table-cell">
                        {formatAdminDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/complaints/${c.id}`}
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
    </div>
  );
}
