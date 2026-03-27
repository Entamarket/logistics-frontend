"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getUnreadNotificationCount, getWsToken, buildNotificationsWebSocketUrl } from "@/lib/notifications-api";

export type NotificationContextValue = {
  unreadCount: number;
  refreshUnread: () => Promise<void>;
  connected: boolean;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}

export function useNotificationsOptional(): NotificationContextValue | null {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const refreshUnread = useCallback(async () => {
    const res = await getUnreadNotificationCount();
    if (res.success && res.data) {
      setUnreadCount(res.data.count);
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !mountedRef.current) return;

    getWsToken().then((res) => {
      if (!mountedRef.current) return;
      if (!res.success || !res.data?.token) {
        return;
      }
      const url = buildNotificationsWebSocketUrl(res.data.token);
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;
        ws.onopen = () => {
          if (mountedRef.current) setConnected(true);
        };
        ws.onclose = () => {
          if (mountedRef.current) setConnected(false);
          wsRef.current = null;
          reconnectTimerRef.current = setTimeout(connect, 4000);
        };
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(String(ev.data)) as { event?: string; count?: number };
            if (msg.event === "unread_count" && typeof msg.count === "number") {
              setUnreadCount(msg.count);
            } else if (msg.event === "notification") {
              void refreshUnread();
            }
          } catch {
            /* ignore malformed */
          }
        };
        ws.onerror = () => {
          ws.close();
        };
      } catch {
        reconnectTimerRef.current = setTimeout(connect, 4000);
      }
    });
  }, [refreshUnread]);

  useEffect(() => {
    mountedRef.current = true;
    void refreshUnread();
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect, refreshUnread]);

  const value: NotificationContextValue = {
    unreadCount,
    refreshUnread,
    connected,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
