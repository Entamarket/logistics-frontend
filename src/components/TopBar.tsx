"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { logout } from "@/lib/auth-api";

interface TopBarProps {
  brandHref?: string;
  onMenuClick?: () => void;
}

export function TopBar({ brandHref = "/dashboard", onMenuClick }: TopBarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setDropdownOpen(false);
    await logout();
    router.replace("/auth/login");
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-30 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-white border-b border-neutral-200 safe-area-inset-top">
      <div className="flex items-center gap-2 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-1 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link href={brandHref} className="flex items-center shrink-0" onClick={() => setDropdownOpen(false)}>
          <img src="/logo.jpg" alt="Logo" className="h-9 w-auto object-contain" />
        </Link>
      </div>

      <div className="relative flex items-center" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2"
          aria-label="User menu"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <svg className="w-8 h-8 sm:w-9 sm:h-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-1 w-48 py-1 rounded-lg bg-white border border-neutral-200 shadow-lg z-50"
            role="menu"
          >
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
              role="menuitem"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
