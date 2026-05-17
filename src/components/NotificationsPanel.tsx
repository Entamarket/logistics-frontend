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

function typePillClass(type: string): string {
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

function accentBarClass(type: string, read: boolean): string {
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

function notificationCardClass(n: NotificationRecord): string {
  const base =
    "relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5";
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

export function NotificationsPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isRider = pathname.startsWith("/rider");
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

  return (
    <div className="max-w-2xl space-y-6">
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

      {(unreadCount > 0 || notifCtx) && (
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-[#81007f] px-3 py-1 text-xs font-bold text-white shadow-[0_4px_16px_rgba(129,0,127,0.35),0_0_20px_rgba(168,85,247,0.3)]">
              {unreadCount} unread
            </span>
          )}
          {notifCtx && (
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm shadow-purple-500/10">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  notifCtx.connected
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    : "bg-neutral-400"
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
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-purple-200/60 bg-gradient-to-r from-purple-100/70 via-fuchsia-50/50 to-purple-100/70 shadow-[0_0_24px_rgba(168,85,247,0.12),0_8px_32px_rgba(129,0,127,0.08)]"
            />
          ))}
        </div>
      )}

      {error && (
        <div
          className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_4px_20px_rgba(239,68,68,0.12),0_0_24px_rgba(239,68,68,0.15)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/50 px-6 py-12 text-center shadow-[inset_0_0_32px_rgba(168,85,247,0.08),0_0_48px_rgba(129,0,127,0.1)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(129,0,127,0.2),0_0_32px_rgba(168,85,247,0.25)]">
            <BellIcon className="h-7 w-7 text-[#81007f]/70" />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-800">No notifications yet</p>
          <p className="mt-1 text-sm text-neutral-500">
            When something happens on your account, alerts will show up here.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="space-y-4">
          {items.map((n) => (
            <li key={n._id} className={notificationCardClass(n)}>
              <div className={accentBarClass(n.type, n.read)} aria-hidden />
              <div className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={typePillClass(n.type)}>{typeLabel(n.type)}</span>
                  {!n.read && (
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#81007f] shadow-[0_0_10px_rgba(129,0,127,0.8)]"
                      title="Unread"
                      aria-label="Unread"
                    />
                  )}
                </div>
                <h2 className="text-base font-semibold text-neutral-900">{n.title}</h2>
                <p className="text-sm text-neutral-700 leading-relaxed">{n.message}</p>
                <p className="text-xs text-neutral-500">{formatWhen(n.createdAt)}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {isAdmin && n.relatedComplaintId && (
                    <Link
                      href={`/admin/complaints/${n.relatedComplaintId}`}
                      className="text-sm font-semibold text-[#81007f] hover:underline"
                    >
                      View complaint →
                    </Link>
                  )}
                  {n.relatedShipmentId && (
                    <Link
                      href={
                        isAdmin
                          ? `/admin/shipments/${n.relatedShipmentId}`
                          : shipmentHref()
                      }
                      className="text-sm font-semibold text-[#81007f] hover:underline"
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
                      className="ml-auto rounded-lg border border-purple-200/80 bg-purple-50/80 px-3 py-1.5 text-xs font-semibold text-[#81007f] shadow-sm shadow-purple-500/10 transition hover:bg-purple-100 hover:shadow-[0_4px_16px_rgba(129,0,127,0.15)] disabled:opacity-50 min-h-[36px] sm:min-h-0"
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
}
