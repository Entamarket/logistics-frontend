"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

const adminNavItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/riders", label: "Riders" },
  { href: "/admin/shipments", label: "Shipments" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ffffff] flex flex-col safe-area-inset">
      <TopBar brandHref="/admin" onMenuClick={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 pt-14">
        <Sidebar
          navItems={adminNavItems}
          brandHref="/admin"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 md:ml-56">
          {children}
        </main>
      </div>
    </div>
  );
}
