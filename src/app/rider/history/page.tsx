"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRiderShipments, type ShipmentData } from "@/lib/shipment-api";
import {
  RiderEmptyState,
  RiderErrorAlert,
  RiderLoadingBlock,
  RiderPageHeader,
  RiderShell,
  RiderStatCard,
  riderAvatarPurple,
  riderCard,
  riderCardAccentPurple,
  riderNeonBoxAmber,
  riderNeonBoxPurple,
  riderStatusBadge,
} from "@/components/rider/RiderUI";

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
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

  const delivered = shipments.filter((s) => s.status === "delivered").length;
  const cancelled = shipments.filter((s) => s.status === "cancelled").length;

  return (
    <RiderShell className="max-w-2xl">
      <div className="space-y-6">
        <RiderPageHeader
          badge="Archive"
          title="Delivery history"
          description="Completed and cancelled deliveries you have handled appear here."
          icon={<HistoryIcon className="h-6 w-6" />}
        />

        {!loading && !error && shipments.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            <RiderStatCard label="Total" value={shipments.length} hint="In history" tone="violet" />
            <RiderStatCard label="Delivered" value={delivered} hint="Completed" tone="purple" />
            <RiderStatCard label="Cancelled" value={cancelled} hint="Did not complete" tone="amber" />
          </div>
        )}

        {loading && <RiderLoadingBlock label="Loading delivery history…" />}

        {!loading && error && <RiderErrorAlert>{error}</RiderErrorAlert>}

        {!loading && !error && shipments.length === 0 && (
          <RiderEmptyState
            icon={<HistoryIcon className="h-7 w-7" />}
            title="No past deliveries yet"
            description="When you finish or cancel a job, it will show up in this list."
          />
        )}

        {!loading && !error && shipments.length > 0 && (
          <ul className="space-y-4">
            {shipments.map((s) => {
              const lastTs = s.timeline?.length
                ? s.timeline[s.timeline.length - 1]?.timestamp
                : s.updatedAt;

              return (
                <li key={s._id} className={riderCard}>
                  <div className={riderCardAccentPurple} aria-hidden />
                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={riderAvatarPurple}>
                          {recipientInitial(s.recipientDetails.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-slate-900">
                            {s.recipientDetails.fullName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">Updated {formatDate(lastTs)}</p>
                        </div>
                      </div>
                      <span className={riderStatusBadge(s.status)}>{formatStatus(s.status)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-xs font-bold text-emerald-800 shadow-[0_0_12px_rgba(16,185,129,0.22)] ring-1 ring-emerald-200/60">
                        ₦{s.price.toLocaleString()}
                      </span>
                      <span className="inline-flex rounded-full border border-purple-200/80 bg-purple-50/90 px-3 py-1 text-xs font-medium text-[#6a0068] shadow-[0_0_12px_rgba(129,0,127,0.18)] ring-1 ring-purple-200/60">
                        {s.deliveryType === "scheduled" ? "Scheduled" : "Instant"}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className={riderNeonBoxAmber}>
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-900">
                          <LocationPinIcon className="h-3.5 w-3.5 text-amber-600 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                          Pickup
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{s.senderDetails.address}</p>
                      </div>
                      <div className={riderNeonBoxPurple}>
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#6a0068]">
                          <LocationPinIcon className="h-3.5 w-3.5 text-[#81007f] drop-shadow-[0_0_6px_rgba(129,0,127,0.5)]" />
                          Drop-off
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{s.recipientDetails.address}</p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </RiderShell>
  );
}
