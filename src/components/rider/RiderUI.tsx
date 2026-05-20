"use client";

import type { ReactNode } from "react";

/** Rider dashboard: light theme + purple neon glow (#81007f), distinct from admin dark neon. */

export const RIDER_BRAND = "#81007f";
export const RIDER_BRAND_DARK = "#6a0068";
export const RIDER_BRAND_LIGHT = "#9d33a0";

/** Shared purple neon stack for cards and shells */
export const riderNeonPurple =
  "shadow-[0_0_0_1px_rgba(129,0,127,0.18),0_8px_32px_rgba(129,0,127,0.12),0_0_48px_rgba(192,38,211,0.1)]";
export const riderNeonPurpleHover =
  "hover:shadow-[0_0_0_1px_rgba(129,0,127,0.28),0_12px_40px_rgba(129,0,127,0.16),0_0_64px_rgba(217,70,239,0.18)]";

export const riderSelectClass =
  "w-full min-h-[44px] cursor-pointer rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-800 shadow-[0_2px_12px_rgba(15,23,42,0.06)] focus:border-[#81007f] focus:outline-none focus:ring-2 focus:ring-[#81007f]/30 focus:shadow-[0_0_0_3px_rgba(129,0,127,0.12),0_0_24px_rgba(192,38,211,0.15)]";

export const riderInputClass =
  "mt-1 block w-full min-h-[44px] rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-base text-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.06)] placeholder:text-slate-400 focus:border-[#81007f] focus:outline-none focus:ring-2 focus:ring-[#81007f]/30 focus:shadow-[0_0_0_3px_rgba(129,0,127,0.12),0_0_24px_rgba(192,38,211,0.15)]";

export const riderLabelClass = "block text-sm font-semibold text-slate-700";

export const riderBtnPrimary =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-[#6a0068] to-[#81007f] px-5 text-sm font-semibold text-white ring-1 ring-white/25 shadow-[0_0_28px_rgba(129,0,127,0.45),0_8px_24px_rgba(106,0,104,0.35)] transition hover:from-[#81007f] hover:to-[#9d33a0] hover:shadow-[0_0_40px_rgba(217,70,239,0.5),0_12px_28px_rgba(129,0,127,0.35)] disabled:opacity-55";

export const riderBtnSecondary =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-purple-200/80 bg-white px-5 text-sm font-semibold text-slate-800 shadow-[0_4px_16px_rgba(129,0,127,0.08)] transition hover:border-[#81007f]/40 hover:bg-[#faf8fb] hover:shadow-[0_0_24px_rgba(129,0,127,0.12),0_6px_20px_rgba(15,23,42,0.08)] disabled:opacity-55";

export const riderBtnAccent =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 text-sm font-semibold text-white ring-1 ring-white/30 shadow-[0_0_24px_rgba(245,158,11,0.4),0_8px_20px_rgba(234,88,12,0.25)] transition hover:from-amber-400 hover:to-orange-400 hover:shadow-[0_0_36px_rgba(251,191,36,0.45),0_10px_24px_rgba(234,88,12,0.3)] disabled:opacity-55";

export const riderCard =
  `overflow-hidden rounded-2xl border border-purple-200/70 bg-white/95 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${riderNeonPurple} ${riderNeonPurpleHover}`;

export const riderCardAccentPurple =
  "h-1 w-full bg-gradient-to-r from-[#9d33a0] via-[#81007f] to-[#6a0068] shadow-[0_0_20px_rgba(129,0,127,0.55),0_0_40px_rgba(192,38,211,0.3)]";
/** @deprecated Use riderCardAccentPurple */
export const riderCardAccentTeal = riderCardAccentPurple;
export const riderCardAccentAmber =
  "h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.45),0_0_36px_rgba(251,146,60,0.2)]";

/** Nested location / info panels */
export const riderNeonBoxPurple =
  "rounded-xl border border-purple-200/80 bg-gradient-to-br from-[#faf8fb]/95 via-white to-purple-50/50 p-3 shadow-[0_0_0_1px_rgba(129,0,127,0.14),0_4px_20px_rgba(129,0,127,0.1),0_0_32px_rgba(192,38,211,0.1)]";
export const riderNeonBoxAmber =
  "rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/30 p-3 shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_4px_20px_rgba(245,158,11,0.12),0_0_28px_rgba(251,146,60,0.1)]";
export const riderNeonBoxEmerald =
  "inline-flex rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-xs font-bold text-emerald-800 shadow-[0_0_12px_rgba(16,185,129,0.25),0_2px_8px_rgba(16,185,129,0.1)] ring-1 ring-emerald-200/60";

export const riderAvatarPurple =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6a0068] to-[#81007f] text-base font-bold text-white shadow-[0_4px_16px_rgba(129,0,127,0.45),0_0_28px_rgba(217,70,239,0.35)] ring-1 ring-white/20";

export function RiderShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-3xl border border-purple-200/80 bg-gradient-to-br from-[#faf8fb] via-white to-purple-50/60 shadow-[0_0_0_1px_rgba(129,0,127,0.2),0_16px_48px_rgba(129,0,127,0.12),0_0_80px_-20px_rgba(192,38,211,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-300/30 blur-3xl shadow-[0_0_80px_rgba(251,191,36,0.25)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-purple-300/35 blur-3xl shadow-[0_0_90px_rgba(129,0,127,0.35)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-1/4 top-1/3 h-36 w-36 rounded-full bg-fuchsia-300/30 blur-3xl shadow-[0_0_70px_rgba(217,70,239,0.3)]"
        aria-hidden
      />
      <div className="relative p-5 sm:p-7">{children}</div>
    </div>
  );
}

export function RiderPageHeader({
  badge,
  title,
  description,
  icon,
  action,
}: {
  badge: string;
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6a0068] to-[#81007f] text-white ring-1 ring-white/25 shadow-[0_0_32px_rgba(129,0,127,0.5),0_8px_24px_rgba(106,0,104,0.35)]">
          {icon}
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-300/60 bg-purple-50/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#6a0068] shadow-[0_0_16px_rgba(129,0,127,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#81007f] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#81007f] shadow-[0_0_8px_rgba(129,0,127,0.9)]" />
            </span>
            {badge}
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="bg-gradient-to-r from-[#6a0068] via-[#81007f] to-[#9d33a0] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(129,0,127,0.25)]">
              {title}
            </span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function RiderStatCard({
  label,
  value,
  hint,
  tone = "purple",
}: {
  label: string;
  value: string | number;
  hint: string;
  tone?: "purple" | "violet" | "amber";
}) {
  const border =
    tone === "amber"
      ? "border-amber-200/90 shadow-[0_0_0_1px_rgba(245,158,11,0.15),0_8px_28px_rgba(245,158,11,0.14),0_0_40px_rgba(251,146,60,0.12)]"
      : tone === "violet"
        ? "border-fuchsia-200/90 shadow-[0_0_0_1px_rgba(192,38,211,0.15),0_8px_28px_rgba(192,38,211,0.12),0_0_44px_rgba(217,70,239,0.1)]"
        : "border-purple-200/90 shadow-[0_0_0_1px_rgba(129,0,127,0.18),0_8px_28px_rgba(129,0,127,0.14),0_0_44px_rgba(192,38,211,0.12)]";
  const valueColor =
    tone === "amber"
      ? "text-amber-700 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]"
      : tone === "violet"
        ? "text-fuchsia-700 drop-shadow-[0_0_12px_rgba(192,38,211,0.3)]"
        : "text-[#81007f] drop-shadow-[0_0_12px_rgba(129,0,127,0.3)]";

  return (
    <div
      className={`rounded-2xl border bg-white/95 px-4 py-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${border}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export function RiderLoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-purple-200/70 bg-white/90 px-4 py-4 text-sm text-slate-600 shadow-[0_4px_20px_rgba(129,0,127,0.08),0_0_32px_rgba(192,38,211,0.06)]"
      role="status"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-[#81007f] shadow-[0_0_10px_rgba(129,0,127,0.4)]" />
      {label}
    </div>
  );
}

export function RiderErrorAlert({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-[0_0_20px_rgba(248,113,113,0.2),0_4px_16px_rgba(239,68,68,0.1)]"
      role="alert"
    >
      {children}
    </div>
  );
}

export function RiderSuccessAlert({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-emerald-200/90 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-[0_0_20px_rgba(16,185,129,0.2),0_4px_16px_rgba(52,211,153,0.1)]"
      role="status"
    >
      {children}
    </div>
  );
}

export function RiderWarningAlert({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.22),0_4px_16px_rgba(251,191,36,0.1)]"
      role="status"
    >
      {children}
    </div>
  );
}

export function RiderEmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-purple-300/70 bg-white/80 px-6 py-12 text-center shadow-[0_0_0_1px_rgba(129,0,127,0.1),0_8px_32px_rgba(129,0,127,0.08),0_0_48px_rgba(192,38,211,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-[#f5eef5] text-[#81007f] ring-1 ring-purple-200/60 shadow-[0_0_28px_rgba(129,0,127,0.35),inset_0_1px_0_rgba(255,255,255,0.9)]">
        {icon}
      </div>
      <p className="mt-4 text-base font-semibold text-slate-800">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function riderStatusBadge(status: string): string {
  const base = "inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize";
  switch (status) {
    case "delivered":
      return `${base} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800 ring-1 ring-red-200 shadow-[0_0_12px_rgba(248,113,113,0.2)]`;
    case "awaiting_rider_response":
      return `${base} bg-amber-100 text-amber-900 ring-1 ring-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
      return `${base} bg-purple-100 text-[#6a0068] ring-1 ring-purple-200 shadow-[0_0_14px_rgba(129,0,127,0.3)]`;
    default:
      return `${base} bg-slate-100 text-slate-700 ring-1 ring-slate-200`;
  }
}
