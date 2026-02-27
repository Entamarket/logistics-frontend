"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

const clientNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/create-shipment", label: "Create shipment" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/active", label: "Active shipment" },
  { href: "/dashboard/history", label: "Shipment history" },
  { href: "/dashboard/profile", label: "Profile setting" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ffffff] flex flex-col safe-area-inset">
      <TopBar brandHref="/dashboard" onMenuClick={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 pt-14">
        <Sidebar
          navItems={clientNavItems}
          brandHref="/dashboard"
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
