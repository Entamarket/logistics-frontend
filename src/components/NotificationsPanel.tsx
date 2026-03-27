"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationRecord,
} from "@/lib/notifications-api";
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

export function NotificationsPanel() {
  const router = useRouter();
  const notifCtx = useNotificationsOptional();
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

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

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Notifications</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Live updates when your shipments move. Unread items are highlighted.
          </p>
        </div>
        {items.some((n) => !n.read) && (
          <button
            type="button"
            onClick={onMarkAll}
            disabled={busyId === "__all__"}
            className="text-sm font-medium text-[#81007f] hover:underline disabled:opacity-50 min-h-[44px] sm:min-h-0"
          >
            {busyId === "__all__" ? "Marking…" : "Mark all read"}
          </button>
        )}
      </div>

      {notifCtx && (
        <p className="text-xs text-neutral-500">
          Live connection: {notifCtx.connected ? "connected" : "reconnecting…"}
        </p>
      )}

      {loading && <p className="text-sm text-neutral-500">Loading…</p>}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-neutral-500">No notifications yet.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n._id}
              className={`rounded-lg border px-4 py-3 text-sm ${
                n.read ? "border-neutral-200 bg-white" : "border-[#81007f]/30 bg-[#81007f]/5"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">{n.title}</p>
                  <p className="text-neutral-600 mt-1">{n.message}</p>
                  <p className="text-xs text-neutral-500 mt-2">{formatWhen(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(n._id)}
                    disabled={busyId === n._id}
                    className="shrink-0 text-xs font-medium text-[#81007f] hover:underline disabled:opacity-50"
                  >
                    {busyId === n._id ? "…" : "Mark read"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
