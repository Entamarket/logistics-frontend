"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getRiders, getRiderDisplayName, getRiderUser, type RiderData } from "@/lib/riders-api";

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

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<RiderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRiders().then((res) => {
      setLoading(false);
      if (res.success && res.data) setRiders(res.data);
      else setError(res.message || "Failed to load riders");
    });
  }, []);

  const stats = useMemo(() => {
    const total = riders.length;
    const active = riders.filter((r) => r.status === "active").length;
    const available = riders.filter((r) => r.isAvailable).length;
    return { total, active, available };
  }, [riders]);

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-fuchsia-500/25 bg-gradient-to-br from-slate-950 via-[#1a0a24] to-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_80px_-20px_rgba(192,38,211,0.55),0_32px_64px_-24px_rgba(0,0,0,0.65)]">
      {/* ambient glow */}
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
        {/* header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-fuchsia-200/90 shadow-[0_0_20px_rgba(232,121,249,0.25)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_8px_#f0abfc]" />
              </span>
              Fleet live
            </p>
            <h1 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(232,121,249,0.45)]">
                Riders
              </span>
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/55">
              Manage your delivery network. Glow highlights signal availability and account health at a glance.
            </p>
          </div>
          <Link
            href="/admin/riders/create"
            className="group inline-flex min-h-[48px] items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-[#81007f] to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(129,0,127,0.55),0_12px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/20 transition hover:shadow-[0_0_40px_rgba(217,70,239,0.65),0_16px_32px_-8px_rgba(0,0,0,0.55)] hover:ring-fuchsia-300/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span className="rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-xs">+</span>
            Create rider
            <span className="translate-x-0 transition group-hover:translate-x-0.5" aria-hidden>
              →
            </span>
          </Link>
        </div>

        {!loading && !error && riders.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total" value={stats.total} hint="Registered riders" accent="violet" />
            <StatCard label="Active" value={stats.active} hint="Status: active" accent="emerald" />
            <StatCard label="On duty" value={stats.available} hint="Marked available" accent="cyan" />
          </div>
        )}

        {loading && (
          <div
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            role="status"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
            Loading riders…
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

        {!loading && !error && riders.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-lg font-semibold text-white/90">No riders yet</p>
            <p className="mt-2 text-sm text-white/45">Create your first rider to light up the fleet board.</p>
            <Link
              href="/admin/riders/create"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-5 text-sm font-medium text-fuchsia-100 shadow-[0_0_24px_rgba(232,121,249,0.2)] transition hover:bg-fuchsia-500/25 hover:shadow-[0_0_32px_rgba(232,121,249,0.35)]"
            >
              Create rider
            </Link>
          </div>
        )}

        {!loading && !error && riders.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_-10px_rgba(129,0,127,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04]">
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Name
                    </th>
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Phone
                    </th>
                    <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 sm:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Status
                    </th>
                    <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 md:table-cell">
                      Verified
                    </th>
                    <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 sm:table-cell">
                      Available
                    </th>
                    <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {riders.map((r) => {
                    const user = getRiderUser(r);
                    const statusClass =
                      r.status === "active"
                        ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.25)]"
                        : r.status === "suspended"
                          ? "border-amber-400/45 bg-amber-500/15 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.2)]"
                          : r.status === "blocked"
                            ? "border-red-400/50 bg-red-500/15 text-red-100 shadow-[0_0_16px_rgba(248,113,113,0.22)]"
                            : "border-white/15 bg-white/10 text-white/80 shadow-[0_0_12px_rgba(255,255,255,0.06)]";

                    return (
                      <tr
                        key={r._id}
                        className="group transition-colors hover:bg-white/[0.06] hover:shadow-[inset_0_0_40px_rgba(129,0,127,0.08)]"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/35 bg-gradient-to-br from-fuchsia-500/25 to-violet-600/20 font-mono text-sm font-bold text-fuchsia-100 shadow-[0_0_20px_rgba(192,38,211,0.35)]">
                              {getRiderDisplayName(r).charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium text-white/95">{getRiderDisplayName(r)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-sm text-white/65">{user?.phone ?? "—"}</td>
                        <td className="hidden px-4 py-4 text-sm text-white/55 sm:table-cell">{user?.email ?? "—"}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="hidden px-4 py-4 md:table-cell">
                          <span
                            className={
                              r.isVerified
                                ? "inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-xs font-medium text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                                : "text-xs text-white/35"
                            }
                          >
                            {r.isVerified ? "Verified" : "—"}
                          </span>
                        </td>
                        <td className="hidden px-4 py-4 sm:table-cell">
                          <span
                            className={
                              r.isAvailable
                                ? "font-medium text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                : "text-white/40"
                            }
                          >
                            {r.isAvailable ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={"/admin/riders/" + r._id}
                              className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-100 shadow-[0_0_14px_rgba(232,121,249,0.15)] transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/20 hover:shadow-[0_0_20px_rgba(232,121,249,0.35)]"
                            >
                              View
                            </Link>
                            <Link
                              href={"/admin/riders/" + r._id + "/edit"}
                              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/10 hover:shadow-[0_0_16px_rgba(255,255,255,0.08)]"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
