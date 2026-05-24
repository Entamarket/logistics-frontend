"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getShipments, type ShipmentData } from "@/lib/shipment-api";
import { useNotifications } from "@/contexts/NotificationContext";
import { ClientPageHeader, ClientLoadingBlock } from "@/components/client/ClientUI";

const THEME = "#81007f";

const TERMINAL_STATUSES = new Set(["delivered", "cancelled"]);

function isActiveStatus(status: string): boolean {
  return !TERMINAL_STATUSES.has(status);
}

function lastNMonthLabels(n: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(d.toLocaleString(undefined, { month: "short", year: "2-digit" }));
  }
  return out;
}

function deliveredAt(s: ShipmentData): Date {
  if (s.status !== "delivered") return new Date(0);
  const fromTimeline = [...(s.timeline || [])].reverse().find((e) => e.status === "delivered");
  if (fromTimeline?.timestamp) return new Date(fromTimeline.timestamp);
  return new Date(s.updatedAt || s.createdAt);
}

function bucketDeliveredByMonth(shipments: ShipmentData[], n: number): number[] {
  const counts = new Array(n).fill(0);
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const bucket = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    const y = bucket.getFullYear();
    const m = bucket.getMonth();
    for (const s of shipments) {
      if (s.status !== "delivered") continue;
      const t = deliveredAt(s);
      if (t.getTime() === 0) continue;
      if (t.getFullYear() === y && t.getMonth() === m) counts[i] += 1;
    }
  }
  return counts;
}

function shortRef(id: string): string {
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export default function DashboardOverviewPage() {
  const { unreadCount } = useNotifications();
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const res = await getShipments();
    if (res.success && res.data) setShipments(res.data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const stats = useMemo(() => {
    let active = 0;
    let history = 0;
    let totalSpent = 0;
    for (const s of shipments) {
      if (isActiveStatus(s.status)) active += 1;
      else if (TERMINAL_STATUSES.has(s.status)) history += 1;
      if (s.status === "delivered") totalSpent += s.price ?? 0;
    }
    const total = shipments.length;
    const delivered = shipments.filter((s) => s.status === "delivered").length;
    const pctDelivered = total ? Math.round((delivered / total) * 100) : 0;
    const pctActive = total ? Math.round((active / total) * 100) : 0;
    return { active, history, total, delivered, totalSpent, pctDelivered, pctActive };
  }, [shipments]);

  const chartMonths = 8;
  const monthLabels = useMemo(() => lastNMonthLabels(chartMonths), []);
  const monthlyDeliveredCounts = useMemo(
    () => bucketDeliveredByMonth(shipments, chartMonths),
    [shipments]
  );
  const chartMax = Math.max(1, ...monthlyDeliveredCounts);
  const totalDeliveredInRange = useMemo(
    () => monthlyDeliveredCounts.reduce((a, b) => a + b, 0),
    [monthlyDeliveredCounts]
  );

  const recentShipments = useMemo(() => {
    return [...shipments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [shipments]);

  const folderCards = useMemo(() => {
    const cards = [
      {
        href: "/dashboard/active",
        title: "Active shipment",
        subtitle: "In progress & scheduled",
        count: stats.active,
        tone: "from-[#6a0068] to-[#81007f]",
      },
      {
        href: "/dashboard/history",
        title: "Shipment history",
        subtitle: "Delivered & cancelled",
        count: stats.history,
        tone: "from-[#81007f] to-[#9d33a0]",
      },
      {
        href: "/dashboard/create-shipment",
        title: "Create shipment",
        subtitle: "Book a new delivery",
        count: null as number | null,
        tone: "from-[#9d33a0] to-[#b85cb6]",
      },
    ];
    if (!query.trim()) return cards;
    const q = query.trim().toLowerCase();
    return cards.filter(
      (c) => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
    );
  }, [stats.active, stats.history, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ClientPageHeader
        title="Overview"
        description="Track shipments, spending, and delivery activity from one place."
        icon={
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        }
      />

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quick links (active, history, create…)"
            className="w-full rounded-xl border border-neutral-200 bg-[#faf8fb] py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]"
            aria-label="Search quick links"
          />
        </div>
      </div>

      {loading && <ClientLoadingBlock label="Loading your dashboard…" />}

      {!loading && (
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-neutral-900">Quick access</h2>
                <Link
                  href="/dashboard/create-shipment"
                  className="text-sm font-medium text-[#81007f] hover:underline"
                >
                  New shipment
                </Link>
              </div>
              {folderCards.length === 0 ? (
                <p className="mt-6 text-sm text-neutral-500">No cards match your search.</p>
              ) : (
                <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                  {folderCards.map((card) => (
                    <li key={card.href}>
                      <Link
                        href={card.href}
                        className={`flex h-full min-h-[140px] flex-col justify-between rounded-2xl bg-gradient-to-br ${card.tone} p-4 text-white shadow-md transition hover:opacity-95 hover:shadow-lg`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="rounded-lg bg-white/15 p-2 backdrop-blur-sm">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                              />
                            </svg>
                          </span>
                          {card.count !== null ? (
                            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                              {card.count}
                            </span>
                          ) : (
                            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">+</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-tight">{card.title}</p>
                          <p className="mt-1 text-xs text-white/85">{card.subtitle}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Delivery activity</h2>
                  <p className="mt-1 text-xs text-neutral-500">
                    Shipments delivered per month (last {chartMonths} months).
                  </p>
                </div>
                <p className="text-xs font-medium text-neutral-600 tabular-nums">
                  Total in view: <span className="text-[#81007f]">{totalDeliveredInRange}</span>
                </p>
              </div>
              <div
                className="mt-6"
                role="img"
                aria-label={`Bar chart of delivered shipments by month. Total ${totalDeliveredInRange} in the last ${chartMonths} months.`}
              >
                <div className="flex h-52 items-end gap-1.5 sm:gap-2">
                  {monthlyDeliveredCounts.map((count, i) => {
                    const pct = chartMax > 0 ? (count / chartMax) * 100 : 0;
                    return (
                      <div key={`bar-${i}`} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                        <span className="text-[11px] font-semibold tabular-nums text-neutral-800 sm:text-xs">
                          {count}
                        </span>
                        <div className="flex h-44 w-full flex-col justify-end rounded-t-md bg-neutral-100/90">
                          <div
                            className="w-full min-h-0 rounded-t-md bg-gradient-to-t from-[#6a0068] to-[#81007f] shadow-sm transition-[height] duration-300"
                            style={{ height: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                            title={`${monthLabels[i]}: ${count} delivered`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between gap-0.5 text-[9px] font-medium text-neutral-500 sm:text-[10px]">
                  {monthLabels.map((label, i) => (
                    <span key={`lbl-${i}-${label}`} className="w-0 flex-1 truncate text-center" title={label}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-neutral-900">Recent shipments</h2>
                <Link href="/dashboard/history" className="text-sm font-medium text-[#81007f] hover:underline">
                  View all
                </Link>
              </div>
              {recentShipments.length === 0 ? (
                <p className="mt-4 text-sm text-neutral-500">
                  No shipments yet.{" "}
                  <Link href="/dashboard/create-shipment" className="font-medium text-[#81007f] hover:underline">
                    Create your first shipment
                  </Link>
                  .
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-neutral-100">
                  {recentShipments.map((s) => (
                    <li key={s._id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold text-[#81007f]">#{shortRef(s._id)}</p>
                        <p className="mt-0.5 truncate text-sm text-neutral-700">
                          {s.recipientDetails?.fullName ?? "Recipient"}
                        </p>
                        <p className="text-xs capitalize text-neutral-500">{statusLabel(s.status)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums text-neutral-900">
                          ₦{(s.price ?? 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(s.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-900">Shipment mix</h3>
                <p className="mt-1 text-xs text-neutral-500">Share of your shipments by outcome.</p>
                <ul className="mt-4 space-y-3">
                  {[
                    { label: "Active / in progress", value: stats.pctActive, color: "bg-[#81007f]" },
                    { label: "Delivered", value: stats.pctDelivered, color: "bg-[#9d33a0]" },
                    {
                      label: "Other (incl. cancelled)",
                      value: stats.total
                        ? Math.max(0, 100 - stats.pctActive - stats.pctDelivered)
                        : 0,
                      color: "bg-[#c9a5c8]",
                    },
                  ].map((row) => (
                    <li key={row.label}>
                      <div className="flex items-center justify-between text-xs text-neutral-600">
                        <span>{row.label}</span>
                        <span className="tabular-nums font-medium text-neutral-900">{row.value}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
                        <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.value}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-900">Snapshot</h3>
                <p className="mt-1 text-xs text-neutral-500">High-level counts from your account.</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-8">
                  <div className="relative h-28 w-28">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(${THEME} 0deg ${(stats.pctDelivered / 100) * 360}deg, #e9d4e9 ${(stats.pctDelivered / 100) * 360}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                      <span className="text-lg font-bold text-[#81007f]">{stats.delivered}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                        delivered
                      </span>
                    </div>
                  </div>
                  <div className="relative h-28 w-28">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#9d33a0 0deg ${(stats.pctActive / 100) * 360}deg, #f0e6f0 ${(stats.pctActive / 100) * 360}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                      <span className="text-lg font-bold text-[#81007f]">{stats.active}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">active</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Account</p>
                  <p className="mt-0.5 text-sm font-semibold text-neutral-900">Client overview</p>
                </div>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/dashboard/notifications"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-[#faf8fb] px-3 py-2.5 text-sm font-medium text-neutral-800 hover:border-[#81007f]/40 hover:bg-[#f5eef5]"
                >
                  <svg className="h-4 w-4 text-[#81007f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  Alerts
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#81007f] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#6a0068]"
                >
                  Profile
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-[#81007f] to-[#5c005a] p-5 text-white shadow-md">
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-4 border-white/25 bg-white/10">
                <svg className="h-14 w-14 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="mt-4 text-center text-sm font-semibold">Track in real time</p>
              <p className="mt-1 text-center text-xs text-white/80">
                Open active shipment to follow pickup, transit, and delivery on the map.
              </p>
              <Link
                href="/dashboard/active"
                className="mt-4 block rounded-xl bg-white/20 py-2.5 text-center text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/30"
              >
                Go to active shipment
              </Link>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "Total shipments",
                  body: "All shipments on your account.",
                  value: stats.total,
                  bg: "bg-[#f5eef5] border-[#e9d4e9]",
                },
                {
                  title: "Total spent",
                  body: "Sum of prices on delivered shipments.",
                  value: `₦${stats.totalSpent.toLocaleString()}`,
                  bg: "bg-[#faf8fb] border-neutral-200/80",
                },
                {
                  title: "Notifications",
                  body: "Unread updates from logistics.",
                  value: unreadCount,
                  bg: "bg-white border-neutral-200/80",
                },
              ].map((row) => (
                <div key={row.title} className={`rounded-2xl border p-4 shadow-sm ${row.bg}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{row.title}</p>
                      <p className="mt-1 text-xs text-neutral-600">{row.body}</p>
                    </div>
                    <span className="shrink-0 text-right text-xl font-bold text-[#81007f] tabular-nums">
                      {row.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
