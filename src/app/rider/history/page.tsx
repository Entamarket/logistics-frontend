"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRiderShipments, type ShipmentData } from "@/lib/shipment-api";

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function statusClass(status: string): string {
  const base =
    "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full capitalize shadow-sm";
  switch (status) {
    case "delivered":
      return `${base} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/80 shadow-[0_0_12px_rgba(16,185,129,0.45)]`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800 ring-1 ring-red-300/80 shadow-[0_0_12px_rgba(239,68,68,0.45)]`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
    case "searching_rider":
      return `${base} bg-sky-100 text-sky-800 ring-1 ring-sky-300/80 shadow-[0_0_12px_rgba(14,165,233,0.45)]`;
    case "awaiting_rider_response":
      return `${base} bg-violet-100 text-violet-800 ring-1 ring-violet-300/80 shadow-[0_0_12px_rgba(139,92,246,0.45)]`;
    case "scheduled":
    case "pending":
      return `${base} bg-amber-100 text-amber-800 ring-1 ring-amber-300/80 shadow-[0_0_12px_rgba(245,158,11,0.45)]`;
    default:
      return `${base} bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200/80`;
  }
}

function neonCardClass(status: string): string {
  const base =
    "relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01]";
  switch (status) {
    case "delivered":
      return `${base} border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/20 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_8px_32px_rgba(16,185,129,0.18),0_0_48px_rgba(34,211,238,0.12)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_12px_40px_rgba(16,185,129,0.28),0_0_64px_rgba(34,211,238,0.2)]`;
    case "cancelled":
      return `${base} border-red-200/80 bg-gradient-to-br from-white via-red-50/30 to-rose-50/20 shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_8px_32px_rgba(239,68,68,0.15),0_0_48px_rgba(244,63,94,0.1)] hover:shadow-[0_0_0_1px_rgba(239,68,68,0.35),0_12px_40px_rgba(239,68,68,0.22),0_0_64px_rgba(244,63,94,0.15)]`;
    default:
      return `${base} border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-fuchsia-50/10 shadow-[0_0_0_1px_rgba(129,0,127,0.2),0_8px_32px_rgba(129,0,127,0.15),0_0_48px_rgba(168,85,247,0.1)] hover:shadow-[0_0_0_1px_rgba(129,0,127,0.35),0_12px_40px_rgba(129,0,127,0.22),0_0_64px_rgba(168,85,247,0.18)]`;
  }
}

function neonAccentBar(status: string): string {
  switch (status) {
    case "delivered":
      return "h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]";
    case "cancelled":
      return "h-0.5 w-full bg-gradient-to-r from-transparent via-red-400 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]";
    default:
      return "h-0.5 w-full bg-gradient-to-r from-transparent via-[#81007f] to-fuchsia-400 shadow-[0_0_12px_rgba(129,0,127,0.8)]";
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function recipientInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function LocationPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function RiderDeliveryHistoryPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await getRiderShipments("history");
    if (res.success && res.data) {
      setShipments(res.data);
      return;
    }
    if (res.message?.toLowerCase().includes("rider access") || res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(res.message || "Could not load history.");
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

  return (
    <div className="max-w-2xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-br from-[#81007f]/10 via-white to-fuchsia-50/50 px-5 py-5 shadow-[0_0_0_1px_rgba(129,0,127,0.15),0_8px_32px_rgba(129,0,127,0.12),0_0_56px_rgba(168,85,247,0.15)]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden />
        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#81007f] text-white shadow-[0_4px_20px_rgba(129,0,127,0.4),0_0_28px_rgba(168,85,247,0.35)]">
            <HistoryIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#81007f] drop-shadow-[0_0_12px_rgba(129,0,127,0.25)]">
              Delivery history
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Completed and cancelled deliveries you have handled appear here.
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading delivery history">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-purple-200/60 bg-gradient-to-r from-purple-100/70 via-fuchsia-50/50 to-purple-100/70 shadow-[0_0_24px_rgba(168,85,247,0.12),0_8px_32px_rgba(129,0,127,0.08)]"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_4px_24px_rgba(239,68,68,0.2),0_0_32px_rgba(239,68,68,0.15)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && shipments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/50 px-6 py-12 text-center shadow-[inset_0_0_32px_rgba(168,85,247,0.08),0_0_48px_rgba(129,0,127,0.1)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(129,0,127,0.2),0_0_32px_rgba(168,85,247,0.25)]">
            <HistoryIcon className="h-7 w-7 text-[#81007f]/70" />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-800">No past deliveries yet</p>
          <p className="mt-1 text-sm text-neutral-500">
            When you finish or cancel a job, it will show up in this list.
          </p>
        </div>
      )}

      {!loading && !error && shipments.length > 0 && (
        <ul className="space-y-5">
          {shipments.map((s) => {
            const lastTs = s.timeline?.length
              ? s.timeline[s.timeline.length - 1]?.timestamp
              : s.updatedAt;

            return (
              <li key={s._id} className={neonCardClass(s.status)}>
                <div className={neonAccentBar(s.status)} aria-hidden />
                <div className="p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#81007f] to-purple-600 text-base font-bold text-white shadow-[0_4px_16px_rgba(129,0,127,0.35)]">
                        {recipientInitial(s.recipientDetails.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-neutral-900 truncate">
                          {s.recipientDetails.fullName}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">Updated {formatDate(lastTs)}</p>
                      </div>
                    </div>
                    <span className={statusClass(s.status)}>{formatStatus(s.status)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                      ₦{s.price.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-purple-50/90 px-3 py-1 text-xs font-medium text-[#81007f] ring-1 ring-purple-200/80 shadow-[0_0_12px_rgba(129,0,127,0.12)]">
                      {s.deliveryType === "scheduled" ? "Scheduled" : "Instant"}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-orange-50/30 p-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-800">
                        <LocationPinIcon className="h-3.5 w-3.5 text-amber-600 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                        Pickup
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{s.senderDetails.address}</p>
                    </div>
                    <div className="rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-blue-50/30 p-3 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sky-800">
                        <LocationPinIcon className="h-3.5 w-3.5 text-sky-600 drop-shadow-[0_0_6px_rgba(14,165,233,0.6)]" />
                        Drop-off
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{s.recipientDetails.address}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
