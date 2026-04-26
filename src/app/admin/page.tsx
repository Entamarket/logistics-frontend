"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminRevenueSummary, type RevenueSummary } from "@/lib/admin-api";

const CHART_MONTHS = 12;
const THEME = "#81007f";
const THEME_DARK = "#5c005a";
const THEME_LIGHT = "#b85cb6";

function formatBarLabel(amount: number): string {
  if (amount <= 0) return "—";
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}k`;
  return `₦${amount}`;
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await getAdminRevenueSummary(CHART_MONTHS);
    if (res.success && res.data) {
      setSummary(res.data);
      return;
    }
    const msg = res.message || "Could not load revenue.";
    if (msg.toLowerCase().includes("admin access")) {
      router.replace("/auth/login");
      return;
    }
    if (msg.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(msg);
  }, [router]);

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

  const chartMax = useMemo(() => {
    if (!summary?.monthly?.length) return 1;
    return Math.max(1, ...summary.monthly.map((m) => m.amount));
  }, [summary]);

  const monthlyTotalInView = useMemo(() => {
    if (!summary?.monthly) return 0;
    return summary.monthly.reduce((a, m) => a + m.amount, 0);
  }, [summary]);

  const currentMonthAmount = summary?.monthly?.[summary.monthly.length - 1]?.amount ?? 0;
  const previousMonthAmount = summary?.monthly?.[summary.monthly.length - 2]?.amount ?? 0;
  const monthChangePct =
    previousMonthAmount > 0
      ? Math.round(((currentMonthAmount - previousMonthAmount) / previousMonthAmount) * 100)
      : currentMonthAmount > 0
        ? 100
        : 0;

  const quickCards = useMemo(() => {
    const list = [
      {
        title: "Wallet",
        subtitle: "All-time earnings",
        value: `₦${summary?.totalEarned?.toLocaleString() ?? "0"}`,
        href: "/admin/shipments",
      },
      {
        title: "Delivered",
        subtitle: "Completed shipments",
        value: `${summary?.deliveredCount ?? 0}`,
        href: "/admin/shipments",
      },
      {
        title: "Active shipments",
        subtitle: "Not delivered or cancelled",
        value: `${summary?.activeShipmentCount ?? 0}`,
        href: "/admin/shipments",
      },
    ];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q));
  }, [summary, currentMonthAmount, query]);

  const ringPct = Math.min(
    100,
    monthlyTotalInView > 0 ? Math.round((currentMonthAmount / monthlyTotalInView) * 100) : 0
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Overview</h1>
        <p className="mt-1 text-sm text-neutral-600">Revenue dashboard with monthly trend and wallet summary.</p>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading…</p>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && summary && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-5">
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
                  placeholder="Search cards (wallet, delivered, active, riders)"
                  className="w-full rounded-xl border border-neutral-200 bg-[#faf8fb] py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-neutral-900">Folders</h2>
                <Link href="/admin/shipments" className="text-xs font-medium text-[#81007f] hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {quickCards.map((card, i) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className={`rounded-2xl p-4 text-white shadow-md transition hover:opacity-95 ${
                      i === 0
                        ? "bg-gradient-to-br from-[#6a0068] to-[#81007f]"
                        : i === 1
                          ? "bg-gradient-to-br from-[#81007f] to-[#9d33a0]"
                          : "bg-gradient-to-br from-[#9d33a0] to-[#b85cb6]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="rounded-lg bg-white/20 p-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 7h16M4 12h16M4 17h10"
                          />
                        </svg>
                      </span>
                    </div>
                    <p className="mt-4 text-xs text-white/85">{card.subtitle}</p>
                    <p className="mt-1 text-sm font-semibold">{card.title}</p>
                    <p className="mt-2 text-lg font-bold tabular-nums">{card.value}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Amount earned per month</h2>
                  <p className="mt-1 text-xs text-neutral-500">Last {CHART_MONTHS} months from delivered shipments.</p>
                </div>
                <p className="text-xs font-medium text-neutral-600 tabular-nums">
                  In view: <span className="text-[#81007f]">₦{monthlyTotalInView.toLocaleString()}</span>
                </p>
              </div>

              <div
                className="mt-6"
                role="img"
                aria-label={`Bar chart of monthly revenue in ${summary.currency}. Total in range ${monthlyTotalInView}.`}
              >
                <div className="flex h-56 items-end gap-1 sm:gap-1.5">
                  {summary.monthly.map((m) => {
                    const pct = chartMax > 0 ? (m.amount / chartMax) * 100 : 0;
                    return (
                      <div key={m.yearMonth} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                        <span className="max-w-full truncate text-[10px] font-semibold tabular-nums text-neutral-800 sm:text-xs">
                          {formatBarLabel(m.amount)}
                        </span>
                        <div className="flex h-44 w-full flex-col justify-end rounded-t-md bg-neutral-100/90">
                          <div
                            className="w-full min-h-0 rounded-t-md shadow-sm"
                            style={{
                              height: `${Math.max(pct, m.amount > 0 ? 8 : 0)}%`,
                              background: `linear-gradient(to top, ${THEME_DARK}, ${THEME})`,
                            }}
                            title={`${m.label}: ₦${m.amount.toLocaleString()}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between gap-0.5 text-[9px] font-medium text-neutral-500 sm:text-[10px]">
                  {summary.monthly.map((m) => (
                    <span key={`lbl-${m.yearMonth}`} className="w-0 flex-1 truncate text-center" title={m.label}>
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900">Wallet summary</h3>
                <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                  <li className="flex justify-between">
                    <span>Total earned</span>
                    <span className="font-semibold text-[#81007f]">₦{summary.totalEarned.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Delivered shipments</span>
                    <span className="font-semibold text-neutral-900">{summary.deliveredCount}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>This month</span>
                    <span className="font-semibold text-neutral-900">₦{currentMonthAmount.toLocaleString()}</span>
                  </li>
                </ul>
              </section>
              <section className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900">Growth pulse</h3>
                <p className="mt-1 text-xs text-neutral-500">Current month against previous month.</p>
                <p className={`mt-3 text-2xl font-bold tabular-nums ${monthChangePct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {monthChangePct >= 0 ? "+" : ""}
                  {monthChangePct}%
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  Prev: ₦{previousMonthAmount.toLocaleString()} · Now: ₦{currentMonthAmount.toLocaleString()}
                </p>
              </section>
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">Preview diagram</h3>
              <div className="mt-4 flex items-center justify-center">
                <div
                  className="relative h-52 w-52 rounded-full"
                  style={{
                    background: `conic-gradient(${THEME_DARK} 0deg ${ringPct * 3.6}deg, ${THEME_LIGHT} ${ringPct * 3.6}deg 300deg, #f2d9f2 300deg 360deg)`,
                  }}
                >
                  <div className="absolute inset-10 rounded-full bg-white" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-[#81007f]">{ringPct}%</span>
                    <span className="text-xs text-neutral-500">month share</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {[
                {
                  label: "Available riders",
                  value: String(summary.availableRidersCount ?? 0),
                  desc: "Active, verified riders marked available for jobs",
                  href: "/admin/riders",
                },
                {
                  label: "Monthly total",
                  value: `₦${monthlyTotalInView.toLocaleString()}`,
                  desc: `Last ${CHART_MONTHS} months`,
                  href: "/admin/shipments",
                },
                {
                  label: "Delivered",
                  value: String(summary.deliveredCount),
                  desc: "Completed shipments count",
                  href: "/admin/shipments",
                },
              ].map((row) => (
                <Link
                  key={row.label}
                  href={row.href}
                  className="block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-[#81007f]/30 hover:shadow"
                >
                  <p className="text-sm font-semibold text-[#81007f]">{row.label}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-neutral-900">{row.value}</p>
                  <p className="mt-1 text-xs text-neutral-500">{row.desc}</p>
                </Link>
              ))}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
