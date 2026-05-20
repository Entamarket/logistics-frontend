"use client";

import type { ReactNode } from "react";

/** Client dashboard: brand purple (#81007f) with light neon glow — matches history / notifications. */

export const CLIENT_BRAND = "#81007f";

export const clientInputClass =
  "mt-1 block w-full min-h-[44px] rounded-xl border border-neutral-200/90 bg-white px-4 py-2.5 text-base text-neutral-900 shadow-[0_2px_12px_rgba(15,23,42,0.05)] placeholder:text-neutral-400 focus:border-[#81007f] focus:outline-none focus:ring-2 focus:ring-[#81007f]/25 focus:shadow-[0_0_0_3px_rgba(129,0,127,0.1),0_0_24px_rgba(168,85,247,0.12)]";

export const clientLabelClass = "block text-sm font-semibold text-neutral-800";

export const clientBtnPrimary =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-[#6a0068] to-[#81007f] px-6 text-sm font-semibold text-white ring-1 ring-white/25 shadow-[0_0_28px_rgba(129,0,127,0.4),0_8px_24px_rgba(106,0,104,0.3)] transition hover:from-[#81007f] hover:to-[#9d33a0] hover:shadow-[0_0_40px_rgba(217,70,239,0.45),0_12px_28px_rgba(129,0,127,0.3)] disabled:opacity-55";

export const clientBtnSecondary =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-[#81007f]/50 bg-white px-5 text-sm font-semibold text-[#81007f] shadow-[0_0_16px_rgba(129,0,127,0.12),0_4px_14px_rgba(15,23,42,0.06)] transition hover:border-[#81007f] hover:bg-[#faf8fb] hover:shadow-[0_0_28px_rgba(129,0,127,0.2)] disabled:opacity-55";

export const clientCard =
  "overflow-hidden rounded-2xl border border-purple-200/70 bg-white/95 backdrop-blur-sm shadow-[0_0_0_1px_rgba(129,0,127,0.12),0_8px_32px_rgba(129,0,127,0.1),0_0_48px_rgba(168,85,247,0.08)] transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(129,0,127,0.2),0_12px_40px_rgba(129,0,127,0.14),0_0_56px_rgba(168,85,247,0.12)]";

export const clientCardAccentPurple =
  "h-1 w-full bg-gradient-to-r from-[#9d33a0] via-[#81007f] to-fuchsia-500 shadow-[0_0_16px_rgba(129,0,127,0.5),0_0_32px_rgba(217,70,239,0.25)]";
export const clientCardAccentAmber =
  "h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.4)]";
export const clientCardAccentViolet =
  "h-1 w-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-[#81007f] shadow-[0_0_16px_rgba(139,92,246,0.4)]";

export const clientInsetPanel =
  "rounded-xl border border-purple-200/60 bg-gradient-to-br from-[#faf8fb]/95 via-white to-fuchsia-50/30 p-4 shadow-[0_0_0_1px_rgba(129,0,127,0.1),0_4px_20px_rgba(129,0,127,0.08),0_0_32px_rgba(168,85,247,0.06)]";

export function ClientShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative space-y-6 ${className}`}>
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-300/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-purple-200/30 blur-3xl"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function ClientPageHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-br from-[#81007f]/10 via-white to-fuchsia-50/50 px-5 py-5 shadow-[0_0_0_1px_rgba(129,0,127,0.15),0_8px_32px_rgba(129,0,127,0.12),0_0_56px_rgba(168,85,247,0.15)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden />
      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#81007f] text-white shadow-[0_4px_20px_rgba(129,0,127,0.4),0_0_28px_rgba(168,85,247,0.35)] ring-1 ring-white/20">
          {icon}
        </div>
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-purple-200/70 bg-white/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#81007f] shadow-[0_0_12px_rgba(129,0,127,0.15)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#81007f] opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#81007f] shadow-[0_0_6px_rgba(129,0,127,0.8)]" />
            </span>
            Client
          </p>
          <h1 className="mt-2 text-xl font-bold text-[#81007f] drop-shadow-[0_0_12px_rgba(129,0,127,0.25)] sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function ClientSection({
  title,
  description,
  accent = "purple",
  children,
}: {
  title: string;
  description?: string;
  accent?: "purple" | "violet" | "amber";
  children: ReactNode;
}) {
  const accentBar =
    accent === "amber"
      ? clientCardAccentAmber
      : accent === "violet"
        ? clientCardAccentViolet
        : clientCardAccentPurple;

  return (
    <section className={clientCard}>
      <div className={accentBar} aria-hidden />
      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-[#81007f]">{title}</h2>
          {description ? <p className="mt-1 text-sm text-neutral-600">{description}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function ClientLoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-purple-200/60 bg-white/90 px-4 py-4 text-sm text-neutral-600 shadow-[0_4px_20px_rgba(129,0,127,0.08)]"
      role="status"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-[#81007f] shadow-[0_0_8px_rgba(129,0,127,0.35)]" />
      {label}
    </div>
  );
}

export function ClientErrorAlert({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_4px_20px_rgba(239,68,68,0.12),0_0_24px_rgba(239,68,68,0.1)]"
      role="alert"
    >
      {children}
    </div>
  );
}

export function ClientSuccessAlert({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-800 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_4px_20px_rgba(16,185,129,0.12),0_0_24px_rgba(52,211,153,0.1)]"
      role="status"
    >
      {children}
    </div>
  );
}

export function ClientEmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-purple-300/70 bg-gradient-to-br from-purple-50/50 via-white to-fuchsia-50/40 px-6 py-12 text-center shadow-[inset_0_0_32px_rgba(168,85,247,0.06),0_0_40px_rgba(129,0,127,0.08)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(129,0,127,0.2),0_0_32px_rgba(168,85,247,0.2)] ring-1 ring-purple-200/60">
        <span className="text-[#81007f]">{icon}</span>
      </div>
      <p className="mt-4 text-base font-semibold text-neutral-900">{title}</p>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
    </div>
  );
}

export function clientComplaintStatus(status: string): string {
  const base =
    "inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize shadow-sm";
  switch (status) {
    case "open":
      return `${base} bg-amber-100 text-amber-900 ring-1 ring-amber-300/80 shadow-[0_0_12px_rgba(245,158,11,0.35)]`;
    case "in_review":
      return `${base} bg-violet-100 text-violet-800 ring-1 ring-violet-300/80 shadow-[0_0_12px_rgba(139,92,246,0.35)]`;
    case "resolved":
      return `${base} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/80 shadow-[0_0_12px_rgba(16,185,129,0.35)]`;
    default:
      return `${base} bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200`;
  }
}

export function ClientCostHighlight({ amount }: { amount: number }) {
  return (
    <p
      className="inline-flex rounded-xl border border-[#81007f]/30 bg-gradient-to-br from-[#faf8fb] to-fuchsia-50/50 px-4 py-2 text-base font-bold text-[#81007f] shadow-[0_0_0_1px_rgba(129,0,127,0.15),0_0_28px_rgba(168,85,247,0.2)]"
      role="status"
    >
      Estimated cost: ₦{amount.toLocaleString()}
    </p>
  );
}

export function ClientToast({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <div className="fixed top-4 right-4 left-4 z-50 max-w-sm md:left-auto" role={error ? "alert" : "status"}>
      {error ? (
        <div className="rounded-xl border border-red-200/80 bg-red-50/95 px-4 py-3 text-sm text-red-700 shadow-[0_8px_28px_rgba(239,68,68,0.2),0_0_24px_rgba(239,68,68,0.15)] backdrop-blur-sm">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/95 px-4 py-3 text-sm text-emerald-800 shadow-[0_8px_28px_rgba(16,185,129,0.18),0_0_24px_rgba(52,211,153,0.12)] backdrop-blur-sm">
          {success}
        </div>
      ) : null}
    </div>
  );
}
