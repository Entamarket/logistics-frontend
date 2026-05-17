"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";

const adminNavItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/riders", label: "Riders" },
  { href: "/admin/shipments", label: "Shipments" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/financial-reports", label: "Financial reports" },
  { href: "/admin/complaints", label: "Complaints" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/settings", label: "Settings" },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ffffff] flex flex-col safe-area-inset">
      <TopBar brandHref="/admin" onMenuClick={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 pt-14">
        <Sidebar
          navItems={adminNavItems}
          brandHref="/admin"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          badgeByHref={{ "/admin/notifications": unreadCount }}
        />
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 md:ml-56">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </NotificationProvider>
  );
}
