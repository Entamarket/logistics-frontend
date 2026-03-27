"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";

const riderNavItems = [
  { href: "/rider", label: "Overview" },
  { href: "/rider/available", label: "Available deliveries" },
  { href: "/rider/active", label: "Active delivery" },
  { href: "/rider/history", label: "Delivery history" },
  { href: "/rider/notifications", label: "Notifications" },
  { href: "/rider/profile", label: "Profile & availability" },
];

function RiderLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ffffff] flex flex-col safe-area-inset">
      <TopBar brandHref="/rider" onMenuClick={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 pt-14">
        <Sidebar
          navItems={riderNavItems}
          brandHref="/rider"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          badgeByHref={{ "/rider/notifications": unreadCount }}
        />
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 md:ml-56">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <RiderLayoutInner>{children}</RiderLayoutInner>
    </NotificationProvider>
  );
}
