"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getShipments, type ShipmentData } from "@/lib/shipment-api";
import { ClientActiveShipmentMap } from "@/components/maps/ClientActiveShipmentMap";

const TERMINAL_STATUSES = new Set(["delivered", "cancelled"]);

function isActiveStatus(status: string) {
  return !TERMINAL_STATUSES.has(status);
}

function statusClass(status: string): string {
  const base = "inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize";
  switch (status) {
    case "delivered":
      return `${base} bg-green-100 text-green-800`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
    case "searching_rider":
      return `${base} bg-blue-100 text-blue-800`;
    case "awaiting_rider_response":
      return `${base} bg-purple-100 text-purple-800`;
    case "scheduled":
    case "pending":
      return `${base} bg-amber-100 text-amber-800`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800`;
    default:
      return `${base} bg-neutral-100 text-neutral-800`;
  }
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Active shipment</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Shipments that are still in progress (not delivered or cancelled).
        </p>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading…</p>}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && shipments.length === 0 && (
        <p className="text-sm text-neutral-500">You have no active shipments.</p>
      )}

      {!loading && !error && shipments.length > 0 && (
        <ul className="space-y-4">
          {shipments.map((s) => (
            <li
              key={s._id}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    To: {s.recipientDetails.fullName}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">Created {formatDate(s.createdAt)}</p>
                </div>
                <span className={statusClass(s.status)}>{s.status.replace(/_/g, " ")}</span>
              </div>
              <p className="text-sm text-neutral-600">
                {s.deliveryType === "scheduled" ? "Scheduled" : "Instant"} · ₦{s.price.toLocaleString()} · Payment:{" "}
                {s.paymentStatus}
              </p>
              {s.status === "awaiting_rider_response" && s.riderResponseDeadline && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Waiting for a rider to accept the offer by {formatDate(s.riderResponseDeadline)}.
                </p>
              )}
              {s.riderID && s.status !== "delivered" && s.status !== "cancelled" && (
                <ClientActiveShipmentMap shipment={s} />
              )}
              <div className="grid gap-2 sm:grid-cols-2 text-sm text-neutral-600">
                <div>
                  <p className="text-xs font-semibold text-[#81007f] uppercase tracking-wide">Pickup</p>
                  <p>{s.senderDetails.address}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#81007f] uppercase tracking-wide">Drop-off</p>
                  <p>{s.recipientDetails.address}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
