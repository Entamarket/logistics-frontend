"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationRecord,
} from "@/lib/notifications-api";
import { shortShipmentId } from "@/lib/admin-api";
import { useNotificationsOptional } from "@/contexts/NotificationContext";
import {
  RiderEmptyState,
  RiderErrorAlert,
  RiderLoadingBlock,
  RiderPageHeader,
  RiderShell,
  riderBtnPrimary,
} from "@/components/rider/RiderUI";

type PanelTheme = "admin" | "rider" | "default";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function typeLabel(type: string): string {
  switch (type) {
    case "shipment_assigned":
      return "Assignment";
    case "rider_accepted_shipment":
      return "Accepted";
    case "delivery_complete":
      return "Delivered";
    case "complaint_submitted":
      return "Complaint";
    default:
      return "Update";
  }
}

function typePillClass(type: string, theme: PanelTheme): string {
  if (theme === "rider") {
    const base =
      "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1";
    switch (type) {
      case "shipment_assigned":
        return `${base} bg-purple-50 text-[#6a0068] ring-purple-200 shadow-[0_0_12px_rgba(129,0,127,0.22)]`;
      case "rider_accepted_shipment":
        return `${base} bg-fuchsia-50 text-[#81007f] ring-fuchsia-200 shadow-[0_0_12px_rgba(192,38,211,0.22)]`;
      case "delivery_complete":
        return `${base} bg-emerald-50 text-emerald-800 ring-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.22)]`;
      case "complaint_submitted":
        return `${base} bg-amber-50 text-amber-900 ring-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]`;
      default:
        return `${base} bg-slate-100 text-slate-700 ring-slate-200 shadow-[0_0_8px_rgba(15,23,42,0.06)]`;
    }
  }
  if (theme === "admin") {
    const base =
      "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide";
    switch (type) {
      case "shipment_assigned":
        return `${base} border-sky-400/45 bg-sky-500/15 text-sky-100 shadow-[0_0_14px_rgba(56,189,248,0.22)]`;
      case "rider_accepted_shipment":
        return `${base} border-fuchsia-400/45 bg-fuchsia-500/15 text-fuchsia-100 shadow-[0_0_14px_rgba(232,121,249,0.22)]`;
      case "delivery_complete":
        return `${base} border-emerald-400/50 bg-emerald-500/15 text-emerald-100 shadow-[0_0_14px_rgba(52,211,153,0.25)]`;
      case "complaint_submitted":
        return `${base} border-amber-400/45 bg-amber-500/15 text-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.2)]`;
      default:
        return `${base} border-white/15 bg-white/10 text-white/85 shadow-[0_0_12px_rgba(255,255,255,0.06)]`;
    }
  }
  const base = "inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full";
  switch (type) {
    case "shipment_assigned":
      return `${base} bg-sky-100 text-sky-800 ring-1 ring-sky-200/80 shadow-[0_0_10px_rgba(14,165,233,0.3)]`;
    case "rider_accepted_shipment":
      return `${base} bg-violet-100 text-violet-800 ring-1 ring-violet-200/80 shadow-[0_0_10px_rgba(139,92,246,0.3)]`;
    case "delivery_complete":
      return `${base} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]`;
    case "complaint_submitted":
      return `${base} bg-amber-100 text-amber-800 ring-1 ring-amber-200/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]`;
    default:
      return `${base} bg-purple-100 text-[#81007f] ring-1 ring-purple-200/80 shadow-[0_0_10px_rgba(129,0,127,0.25)]`;
  }
}

function accentBarClass(type: string, read: boolean, theme: PanelTheme): string {
  if (theme === "rider") {
    if (read) return "h-0.5 w-full bg-gradient-to-r from-transparent via-slate-200 to-slate-100";
    switch (type) {
      case "shipment_assigned":
        return "h-0.5 w-full bg-gradient-to-r from-transparent via-[#9d33a0] to-[#81007f] shadow-[0_0_12px_rgba(129,0,127,0.55)]";
      case "delivery_complete":
        return "h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.5)]";
      case "complaint_submitted":
        return "h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400 to-orange-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]";
      default:
        return "h-0.5 w-full bg-gradient-to-r from-transparent via-[#81007f] to-[#6a0068] shadow-[0_0_14px_rgba(217,70,239,0.5)]";
    }
  }
  if (theme === "admin") {
    if (read) return "h-0.5 w-full bg-gradient-to-r from-transparent via-white/15 to-white/5";
    switch (type) {
      case "shipment_assigned":
        return "h-0.5 w-full bg-gradient-to-r from-transparent via-sky-400 to-blue-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]";
      case "delivery_complete":
        return "h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]";
      case "complaint_submitted":
        return "h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400 to-orange-400 shadow-[0_0_12px_rgba(251,191,36,0.55)]";
      default:
        return "h-0.5 w-full bg-gradient-to-r from-transparent via-fuchsia-500 to-violet-400 shadow-[0_0_12px_rgba(192,38,211,0.6)]";
    }
  }
  if (read) return "h-0.5 w-full bg-gradient-to-r from-transparent via-neutral-300 to-neutral-200";
  switch (type) {
    case "shipment_assigned":
      return "h-0.5 w-full bg-gradient-to-r from-transparent via-sky-400 to-blue-400 shadow-[0_0_12px_rgba(14,165,233,0.7)]";
    case "delivery_complete":
      return "h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]";
    case "complaint_submitted":
      return "h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]";
    default:
      return "h-0.5 w-full bg-gradient-to-r from-transparent via-[#81007f] to-fuchsia-400 shadow-[0_0_12px_rgba(129,0,127,0.7)]";
  }
}

function notificationCardClass(n: NotificationRecord, theme: PanelTheme): string {
  const base =
    "relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5";
  if (theme === "rider") {
    if (n.read) {
      return `${base} border-slate-200/90 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]`;
    }
    switch (n.type) {
      case "shipment_assigned":
        return `${base} border-purple-200/90 bg-gradient-to-br from-[#faf8fb] via-white to-white shadow-[0_0_0_1px_rgba(129,0,127,0.15),0_8px_28px_rgba(129,0,127,0.14),0_0_40px_rgba(192,38,211,0.12)] hover:shadow-[0_0_0_1px_rgba(129,0,127,0.22),0_12px_36px_rgba(129,0,127,0.18),0_0_56px_rgba(217,70,239,0.15)]`;
      case "delivery_complete":
        return `${base} border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-white shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_8px_28px_rgba(16,185,129,0.12),0_0_40px_rgba(52,211,153,0.1)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_12px_36px_rgba(16,185,129,0.16)]`;
      case "complaint_submitted":
        return `${base} border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-white shadow-[0_0_0_1px_rgba(245,158,11,0.15),0_8px_28px_rgba(245,158,11,0.1),0_0_36px_rgba(251,146,60,0.08)] hover:shadow-[0_0_0_1px_rgba(245,158,11,0.22),0_12px_32px_rgba(245,158,11,0.14)]`;
      default:
        return `${base} border-purple-200/80 bg-gradient-to-br from-purple-50/60 via-white to-white shadow-[0_0_0_1px_rgba(129,0,127,0.12),0_8px_28px_rgba(129,0,127,0.12),0_0_44px_rgba(192,38,211,0.1)] hover:shadow-[0_0_0_1px_rgba(129,0,127,0.2),0_12px_36px_rgba(129,0,127,0.16),0_0_52px_rgba(217,70,239,0.12)]`;
    }
  }
  if (theme === "admin") {
    if (n.read) {
      return `${base} border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-white/[0.05]`;
    }
    switch (n.type) {
      case "shipment_assigned":
        return `${base} border-sky-400/30 bg-gradient-to-br from-sky-950/40 via-white/[0.04] to-slate-950/60 shadow-[0_0_32px_-8px_rgba(56,189,248,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]`;
      case "delivery_complete":
        return `${base} border-emerald-400/30 bg-gradient-to-br from-emerald-950/35 via-white/[0.04] to-slate-950/60 shadow-[0_0_32px_-8px_rgba(52,211,153,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]`;
      case "complaint_submitted":
        return `${base} border-amber-400/30 bg-gradient-to-br from-amber-950/30 via-white/[0.04] to-slate-950/60 shadow-[0_0_32px_-8px_rgba(251,191,36,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]`;
      default:
        return `${base} border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/35 via-white/[0.04] to-slate-950/60 shadow-[0_0_36px_-8px_rgba(192,38,211,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]`;
    }
  }
  if (n.read) {
    return `${base} border-neutral-200/90 bg-white shadow-md shadow-neutral-200/40 hover:shadow-lg`;
  }
  switch (n.type) {
    case "shipment_assigned":
      return `${base} border-sky-200/80 bg-gradient-to-br from-white via-sky-50/40 to-blue-50/20 shadow-[0_0_0_1px_rgba(14,165,233,0.2),0_8px_28px_rgba(14,165,233,0.15),0_0_40px_rgba(59,130,246,0.1)] hover:shadow-[0_0_0_1px_rgba(14,165,233,0.3),0_12px_36px_rgba(14,165,233,0.22),0_0_56px_rgba(59,130,246,0.15)]`;
    case "delivery_complete":
      return `${base} border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/40 to-cyan-50/20 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_8px_28px_rgba(16,185,129,0.15),0_0_40px_rgba(34,211,238,0.1)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_12px_36px_rgba(16,185,129,0.22),0_0_56px_rgba(34,211,238,0.15)]`;
    case "complaint_submitted":
      return `${base} border-amber-200/80 bg-gradient-to-br from-white via-amber-50/35 to-orange-50/20 shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_28px_rgba(245,158,11,0.12),0_0_40px_rgba(251,146,60,0.08)] hover:shadow-[0_0_0_1px_rgba(245,158,11,0.3),0_12px_36px_rgba(245,158,11,0.18)]`;
    default:
      return `${base} border-purple-200/80 bg-gradient-to-br from-white via-purple-50/40 to-fuchsia-50/20 shadow-[0_0_0_1px_rgba(129,0,127,0.2),0_8px_28px_rgba(129,0,127,0.14),0_0_40px_rgba(168,85,247,0.1)] hover:shadow-[0_0_0_1px_rgba(129,0,127,0.35),0_12px_36px_rgba(129,0,127,0.2),0_0_56px_rgba(168,85,247,0.15)]`;
  }
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function panelSubtitle(isAdmin: boolean, isRider: boolean): string {
  if (isAdmin) {
    return "Alerts for new complaints and platform activity. Unread items glow until you mark them read.";
  }
  if (isRider) {
    return "New assignments, delivery updates, and alerts. Unread items are highlighted.";
  }
  return "Live updates when your shipments move. Unread items are highlighted.";
}

function AdminNeonShell({ children }: { children: React.ReactNode }) {
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

export function NotificationsPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isRider = pathname.startsWith("/rider");
  const theme: PanelTheme = isAdmin ? "admin" : isRider ? "rider" : "default";
  const notifCtx = useNotificationsOptional();
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    setError("");
    const res = await getNotifications();
    if (res.success && res.data) {
      setItems(res.data);
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(res.message || "Failed to load notifications");
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

  const unreadFromSocket = notifCtx?.unreadCount;
  useEffect(() => {
    if (notifCtx == null || unreadFromSocket === undefined) return;
    void load();
  }, [unreadFromSocket, load, notifCtx]);

  async function onMarkRead(id: string) {
    setBusyId(id);
    const res = await markNotificationRead(id);
    setBusyId(null);
    if (res.success) {
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      await notifCtx?.refreshUnread();
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
    }
  }

  async function onMarkAll() {
    setBusyId("__all__");
    const res = await markAllNotificationsRead();
    setBusyId(null);
    if (res.success) {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      await notifCtx?.refreshUnread();
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
    }
  }

  function shipmentHref(): string {
    return isRider ? "/rider/active" : "/dashboard/active";
  }

  const linkClass =
    theme === "admin"
      ? "text-sm font-semibold text-fuchsia-200 underline decoration-fuchsia-400/40 underline-offset-2 transition hover:text-fuchsia-100"
      : theme === "rider"
        ? "text-sm font-semibold text-[#81007f] hover:underline"
        : "text-sm font-semibold text-[#81007f] hover:underline";

  const markReadBtnClass =
    theme === "admin"
      ? "ml-auto rounded-lg border border-fuchsia-400/35 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-100 shadow-[0_0_14px_rgba(232,121,249,0.15)] transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/20 disabled:opacity-50 min-h-[36px] sm:min-h-0"
      : theme === "rider"
        ? "ml-auto rounded-lg border border-purple-200/80 bg-purple-50/90 px-3 py-1.5 text-xs font-semibold text-[#6a0068] shadow-[0_0_16px_rgba(129,0,127,0.15)] transition hover:bg-[#f5eef5] hover:shadow-[0_0_24px_rgba(129,0,127,0.22)] disabled:opacity-50 min-h-[36px] sm:min-h-0"
        : "ml-auto rounded-lg border border-purple-200/80 bg-purple-50/80 px-3 py-1.5 text-xs font-semibold text-[#81007f] shadow-sm shadow-purple-500/10 transition hover:bg-purple-100 hover:shadow-[0_4px_16px_rgba(129,0,127,0.15)] disabled:opacity-50 min-h-[36px] sm:min-h-0";

  const content = (
    <div className="max-w-2xl space-y-6">
      {theme === "rider" ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <RiderPageHeader
            badge="Alerts"
            title="Notifications"
            description={panelSubtitle(isAdmin, isRider)}
            icon={<BellIcon className="h-6 w-6" />}
          />
          {items.some((n) => !n.read) && (
            <button
              type="button"
              onClick={onMarkAll}
              disabled={busyId === "__all__"}
              className={`${riderBtnPrimary} shrink-0 sm:mt-2`}
            >
              {busyId === "__all__" ? "Marking…" : "Mark all read"}
            </button>
          )}
        </div>
      ) : theme === "admin" ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-fuchsia-200/90 shadow-[0_0_20px_rgba(232,121,249,0.25)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_8px_#f0abfc]" />
              </span>
              Inbox
            </p>
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/30 to-violet-600/25 text-fuchsia-100 shadow-[0_0_28px_rgba(192,38,211,0.4)]">
                <BellIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(232,121,249,0.4)]">
                    Notifications
                  </span>
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/55">
                  {panelSubtitle(isAdmin, isRider)}
                </p>
              </div>
            </div>
          </div>
          {items.some((n) => !n.read) && (
            <button
              type="button"
              onClick={onMarkAll}
              disabled={busyId === "__all__"}
              className="shrink-0 min-h-[44px] rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-100 shadow-[0_0_20px_rgba(232,121,249,0.15)] transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/20 disabled:opacity-50 sm:min-h-0"
            >
              {busyId === "__all__" ? "Marking…" : "Mark all read"}
            </button>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-br from-[#81007f]/10 via-white to-fuchsia-50/50 px-5 py-5 shadow-[0_0_0_1px_rgba(129,0,127,0.15),0_8px_32px_rgba(129,0,127,0.12),0_0_56px_rgba(168,85,247,0.15)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#81007f] text-white shadow-[0_4px_20px_rgba(129,0,127,0.4),0_0_28px_rgba(168,85,247,0.35)]">
                <BellIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#81007f] drop-shadow-[0_0_12px_rgba(129,0,127,0.25)]">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-neutral-600">{panelSubtitle(isAdmin, isRider)}</p>
              </div>
            </div>
            {items.some((n) => !n.read) && (
              <button
                type="button"
                onClick={onMarkAll}
                disabled={busyId === "__all__"}
                className="shrink-0 rounded-xl border border-purple-200/80 bg-white px-4 py-2 text-sm font-semibold text-[#81007f] shadow-sm shadow-purple-500/10 transition hover:bg-purple-50 hover:shadow-[0_4px_20px_rgba(129,0,127,0.15)] disabled:opacity-50 min-h-[44px] sm:min-h-0"
              >
                {busyId === "__all__" ? "Marking…" : "Mark all read"}
              </button>
            )}
          </div>
        </div>
      )}

      {(unreadCount > 0 || notifCtx) && (
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <span
              className={
                theme === "admin"
                  ? "inline-flex items-center rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-3 py-1 text-xs font-bold text-fuchsia-100 shadow-[0_0_20px_rgba(232,121,249,0.3)]"
                  : theme === "rider"
                    ? "inline-flex items-center rounded-full border border-purple-300/70 bg-purple-100/90 px-3 py-1 text-xs font-bold text-[#6a0068] shadow-[0_0_20px_rgba(129,0,127,0.28),inset_0_1px_0_rgba(255,255,255,0.7)]"
                    : "inline-flex items-center rounded-full bg-[#81007f] px-3 py-1 text-xs font-bold text-white shadow-[0_4px_16px_rgba(129,0,127,0.35),0_0_20px_rgba(168,85,247,0.3)]"
              }
            >
              {unreadCount} unread
            </span>
          )}
          {notifCtx && (
            <span
              className={
                theme === "admin"
                  ? "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : theme === "rider"
                    ? "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
                    : "inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm shadow-purple-500/10"
              }
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  notifCtx.connected
                    ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                    : theme === "admin"
                      ? "bg-white/30"
                      : "bg-slate-300"
                }`}
                aria-hidden
              />
              {notifCtx.connected ? "Live updates" : "Reconnecting…"}
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading notifications">
          {theme === "rider" ? (
            <RiderLoadingBlock label="Loading notifications…" />
          ) : theme === "admin" ? (
            <div
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              role="status"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
              Loading notifications…
            </div>
          ) : (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-purple-200/60 bg-gradient-to-r from-purple-100/70 via-fuchsia-50/50 to-purple-100/70 shadow-[0_0_24px_rgba(168,85,247,0.12),0_8px_32px_rgba(129,0,127,0.08)]"
              />
            ))
          )}
        </div>
      )}

      {error &&
        (theme === "rider" ? (
          <RiderErrorAlert>{error}</RiderErrorAlert>
        ) : (
          <div
            className={
              theme === "admin"
                ? "rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100 shadow-[0_0_28px_rgba(248,113,113,0.25)]"
                : "rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_4px_20px_rgba(239,68,68,0.12),0_0_24px_rgba(239,68,68,0.15)]"
            }
            role="alert"
          >
            {error}
          </div>
        ))}

      {!loading && !error && items.length === 0 &&
        (theme === "rider" ? (
          <RiderEmptyState
            icon={<BellIcon className="h-7 w-7" />}
            title="No notifications yet"
            description="When something happens on your account, alerts will show up here."
          />
        ) : (
          <div
            className={
              theme === "admin"
                ? "rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                : "rounded-2xl border border-dashed border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/50 px-6 py-12 text-center shadow-[inset_0_0_32px_rgba(168,85,247,0.08),0_0_48px_rgba(129,0,127,0.1)]"
            }
          >
            <div
              className={
                theme === "admin"
                  ? "mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-fuchsia-500/35 bg-fuchsia-500/15 shadow-[0_0_28px_rgba(192,38,211,0.35)]"
                  : "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(129,0,127,0.2),0_0_32px_rgba(168,85,247,0.25)]"
              }
            >
              <BellIcon className={theme === "admin" ? "h-7 w-7 text-fuchsia-200" : "h-7 w-7 text-[#81007f]/70"} />
            </div>
            <p className={`mt-4 text-sm font-medium ${theme === "admin" ? "text-white/90" : "text-neutral-800"}`}>
              No notifications yet
            </p>
            <p className={`mt-1 text-sm ${theme === "admin" ? "text-white/45" : "text-neutral-500"}`}>
              When something happens on your account, alerts will show up here.
            </p>
          </div>
        ))}

      {!loading && !error && items.length > 0 && (
        <ul className="space-y-4">
          {items.map((n) => (
            <li key={n._id} className={notificationCardClass(n, theme)}>
              <div className={accentBarClass(n.type, n.read, theme)} aria-hidden />
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={typePillClass(n.type, theme)}>{typeLabel(n.type)}</span>
                  {!n.read && (
                    <span
                      className={
                        theme === "admin"
                          ? "h-2.5 w-2.5 shrink-0 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.8)]"
                          : theme === "rider"
                            ? "h-2.5 w-2.5 shrink-0 rounded-full bg-[#81007f] shadow-[0_0_12px_rgba(129,0,127,0.85),0_0_20px_rgba(217,70,239,0.5)]"
                            : "h-2.5 w-2.5 shrink-0 rounded-full bg-[#81007f] shadow-[0_0_10px_rgba(129,0,127,0.8)]"
                      }
                      title="Unread"
                      aria-label="Unread"
                    />
                  )}
                </div>
                <h2
                  className={`text-base font-semibold ${
                    theme === "admin" ? "text-white/95" : "text-slate-900"
                  }`}
                >
                  {n.title}
                </h2>
                <p
                  className={`text-sm leading-relaxed ${
                    theme === "admin" ? "text-white/70" : "text-slate-700"
                  }`}
                >
                  {n.message}
                </p>
                <p className={`text-xs ${theme === "admin" ? "text-white/40" : "text-slate-500"}`}>
                  {formatWhen(n.createdAt)}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {isAdmin && n.relatedComplaintId && (
                    <Link href={`/admin/complaints/${n.relatedComplaintId}`} className={linkClass}>
                      View complaint →
                    </Link>
                  )}
                  {n.relatedShipmentId && (
                    <Link
                      href={
                        isAdmin ? `/admin/shipments/${n.relatedShipmentId}` : shipmentHref()
                      }
                      className={linkClass}
                    >
                      {isAdmin
                        ? `Shipment #${shortShipmentId(n.relatedShipmentId)}`
                        : "View shipment →"}
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(n._id)}
                      disabled={busyId === n._id}
                      className={markReadBtnClass}
                    >
                      {busyId === n._id ? "Marking…" : "Mark read"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (theme === "admin") {
    return <AdminNeonShell>{content}</AdminNeonShell>;
  }

  if (theme === "rider") {
    return <RiderShell>{content}</RiderShell>;
  }

  return content;
}
