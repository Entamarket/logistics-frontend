"use client";

import { useState, useEffect } from "react";
import { getShipments, type ShipmentData } from "@/lib/shipment-api";

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
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ShipmentHistoryPage() {
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getShipments().then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setShipments(res.data);
      } else {
        setError(res.message || "Failed to load shipments");
      }
    });
  }, []);

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Shipment history</h1>
      <p className="mt-1 text-sm text-neutral-500">All your shipments, most recent first.</p>

      {loading && <p className="mt-4 text-sm text-neutral-500">Loading...</p>}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && shipments.length === 0 && (
        <p className="mt-4 text-sm text-neutral-500">No shipments yet. Create one to get started.</p>
      )}

      {!loading && !error && shipments.length > 0 && (
        <ul className="mt-4 space-y-3">
          {shipments.map((s) => (
            <li
              key={s._id}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:border-neutral-300 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    To: {s.recipientDetails.fullName}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Created {formatDate(s.createdAt)}
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">
                    {s.deliveryType === "scheduled" ? "Scheduled" : "Instant"} · ₦{s.price.toLocaleString()}
                  </p>
                </div>
                <span className={statusClass(s.status)}>
                  {s.status.replace(/_/g, " ")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
