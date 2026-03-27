"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRiderShipments, type ShipmentData } from "@/lib/shipment-api";

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

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Delivery history</h1>
        <p className="mt-4 text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Delivery history</h1>
        <p className="mt-2 text-sm text-neutral-600">Deliveries you completed or that were cancelled after assignment.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {shipments.length === 0 ? (
        <p className="text-sm text-neutral-500">No past deliveries yet.</p>
      ) : (
        <ul className="space-y-3">
          {shipments.map((s) => {
            const lastTs = s.timeline?.length ? s.timeline[s.timeline.length - 1]?.timestamp : s.updatedAt;
            return (
              <li
                key={s._id}
                className="rounded-lg border border-neutral-200 bg-white p-4 text-sm shadow-sm flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {s.recipientDetails.fullName} → {s.recipientDetails.address.slice(0, 48)}
                    {s.recipientDetails.address.length > 48 ? "…" : ""}
                  </p>
                  <p className="text-neutral-600 mt-1">
                    ₦{s.price.toLocaleString()} · {formatStatus(s.status)}
                  </p>
                </div>
                <p className="text-xs text-neutral-500 shrink-0">{formatDate(lastTs)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
