"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type Dispatch, type SetStateAction } from "react";

export interface SidebarNavItem {
  href: string;
  label: string;
}

interface SidebarProps {
  navItems: SidebarNavItem[];
  brandHref?: string;
  /** When provided, sidebar is controlled by parent (e.g. TopBar menu button). */
  sidebarOpen?: boolean;
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
  /** Optional unread badge count per nav href (e.g. notifications link). */
  badgeByHref?: Record<string, number>;
}

export function Sidebar({
  navItems,
  brandHref = "/dashboard",
  sidebarOpen: controlledOpen,
  setSidebarOpen: setControlledOpen,
  badgeByHref,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const sidebarOpen = isControlled ? controlledOpen : internalOpen;
  const setSidebarOpen = isControlled ? setControlledOpen! : setInternalOpen;

  return (
    <>
      {!isControlled && (
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-[#81007f] text-white hover:bg-[#6a0068]"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      )}

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-10 bg-black/40"
          aria-label="Close menu"
        />
      )}

      <aside
        className={`w-56 flex-shrink-0 bg-[#81007f] text-white flex flex-col fixed left-0 z-20 transform transition-transform duration-200 ease-out pb-6 min-h-0 ${isControlled ? "top-14 bottom-0 md:top-0 md:bottom-0 md:inset-y-0" : "inset-y-0"} pt-14 md:pt-6 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <Link href={brandHref} className="px-4 py-2 text-lg font-bold text-white hover:underline hidden md:block shrink-0" onClick={() => setSidebarOpen(false)}>
          Logistics
        </Link>
        <nav className="flex-1 min-h-0 mt-4 px-2 space-y-0.5 overflow-y-auto overscroll-contain">
          {navItems.map(({ href, label }) => {
            const basePath = brandHref.replace(/\/$/, "") || "/";
            const isActive = pathname === href || (href !== basePath && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive ? "bg-white/20 text-white" : "text-white/90 hover:bg-white/10"}`}
              >
                <span>{label}</span>
                {badgeByHref && badgeByHref[href] != null && badgeByHref[href] > 0 ? (
                  <span
                    className="min-w-[1.25rem] h-5 shrink-0 px-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center leading-none"
                    aria-label={`${badgeByHref[href]} unread`}
                  >
                    {badgeByHref[href] > 99 ? "99+" : badgeByHref[href]}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="px-4 py-2 text-sm text-white/80 hover:text-white mt-auto shrink-0" onClick={() => setSidebarOpen(false)}>
          Back to home
        </Link>
      </aside>
    </>
  );
}
