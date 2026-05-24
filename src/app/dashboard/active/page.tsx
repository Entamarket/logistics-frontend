"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getShipments, type ShipmentData } from "@/lib/shipment-api";
import { formatContactLocation } from "@/lib/location-data";
import { ClientActiveShipmentMap } from "@/components/maps/ClientActiveShipmentMap";

const TERMINAL_STATUSES = new Set(["delivered", "cancelled"]);

function isActiveStatus(status: string) {
  return !TERMINAL_STATUSES.has(status);
}

function statusClass(status: string): string {
  const base = "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full capitalize shadow-sm";
  switch (status) {
    case "delivered":
      return `${base} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
    case "searching_rider":
      return `${base} bg-sky-100 text-sky-800 ring-1 ring-sky-200/80`;
    case "awaiting_rider_response":
      return `${base} bg-violet-100 text-violet-800 ring-1 ring-violet-200/80`;
    case "scheduled":
    case "pending":
      return `${base} bg-amber-100 text-amber-800 ring-1 ring-amber-200/80`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800 ring-1 ring-red-200/80`;
    default:
      return `${base} bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200/80`;
  }
}

function paymentPillClass(status: string): string {
  const base = "inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full capitalize";
  if (status === "paid") return `${base} bg-emerald-50 text-emerald-700`;
  if (status === "pending") return `${base} bg-amber-50 text-amber-700`;
  return `${base} bg-neutral-100 text-neutral-600`;
}

function formatDate(iso: string): string {
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

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 17h8m-8 0a2 2 0 11-4 0m12 0a2 2 0 11-4 0M3 9h11v8H3V9zm11 0h3l3 4v4h-6V9z"
      />
    </svg>
  );
}

export default function ActiveShipmentPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await getShipments();
    if (res.success && res.data) {
      setShipments(res.data.filter((s) => isActiveStatus(s.status)));
      return;
    }
    if (res.message?.toLowerCase().includes("auth") || res.message?.toLowerCase().includes("token")) {
      router.replace("/auth/login");
      return;
    }
    setError(res.message || "Failed to load shipments");
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
      <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-[#81007f]/8 via-white to-fuchsia-50/40 px-5 py-5 shadow-md shadow-purple-500/10">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#81007f]/10 blur-2xl" aria-hidden />
        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#81007f] text-white shadow-lg shadow-purple-900/25">
            <TruckIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Active shipment</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Track deliveries in progress — live map updates when a rider is assigned.
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading shipments">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-purple-100/60 bg-gradient-to-r from-neutral-100 via-white to-neutral-100 shadow-md"
            />
          ))}
        </div>
      )}

      {error && (
        <div
          className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 shadow-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && shipments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 px-6 py-10 text-center shadow-inner">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md shadow-purple-200/50">
            <TruckIcon className="h-7 w-7 text-[#81007f]/70" />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-800">No active shipments</p>
          <p className="mt-1 text-sm text-neutral-500">
            When you create a delivery, it will appear here until it is delivered or cancelled.
          </p>
        </div>
      )}

      {!loading && !error && shipments.length > 0 && (
        <ul className="space-y-5">
          {shipments.map((s) => (
            <li
              key={s._id}
              className="group overflow-hidden rounded-2xl border border-purple-100/90 bg-white shadow-lg shadow-purple-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/15"
            >
              <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#81007f] to-purple-600 text-base font-bold text-white shadow-md shadow-purple-900/20">
                      {recipientInitial(s.recipientDetails.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-neutral-900 truncate">
                        {s.recipientDetails.fullName}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">Created {formatDate(s.createdAt)}</p>
                    </div>
                  </div>
                  <span className={statusClass(s.status)}>{s.status.replace(/_/g, " ")}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-[#81007f] ring-1 ring-purple-100">
                    {s.deliveryType === "scheduled" ? "Scheduled" : "Instant"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                    ₦{s.price.toLocaleString()}
                  </span>
                  <span className={paymentPillClass(s.paymentStatus)}>
                    Payment: {s.paymentStatus}
                  </span>
                </div>

                {s.status === "awaiting_rider_response" && s.riderResponseDeadline && (
                  <div className="flex gap-2 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 px-3.5 py-2.5 text-xs text-amber-900 shadow-sm">
                    <span className="mt-0.5 text-amber-500" aria-hidden>⏳</span>
                    <p>
                      Waiting for a rider to accept the offer by{" "}
                      <span className="font-semibold">{formatDate(s.riderResponseDeadline)}</span>.
                    </p>
                  </div>
                )}

                {s.riderID && s.status !== "delivered" && s.status !== "cancelled" && (
                  <div className="overflow-hidden rounded-xl border border-purple-100 bg-gradient-to-b from-purple-50/60 to-white p-3 shadow-inner">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#81007f]">Live tracking</p>
                    <ClientActiveShipmentMap shipment={s} />
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-amber-100/90 bg-gradient-to-br from-amber-50/90 to-orange-50/40 p-3.5 shadow-sm">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-800">
                      <LocationPinIcon className="h-3.5 w-3.5 shrink-0" />
                      Pickup
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                      {formatContactLocation(s.senderDetails)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-sky-100/90 bg-gradient-to-br from-sky-50/90 to-blue-50/40 p-3.5 shadow-sm">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sky-800">
                      <LocationPinIcon className="h-3.5 w-3.5 shrink-0" />
                      Drop-off
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                      {formatContactLocation(s.recipientDetails)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
