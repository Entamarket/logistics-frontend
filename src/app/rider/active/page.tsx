"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getRiderShipments,
  markShipmentDelivered,
  acceptRiderShipmentOffer,
  rejectRiderShipmentOffer,
  type ShipmentData,
} from "@/lib/shipment-api";

const AWAITING = "awaiting_rider_response";

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatDeadline(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function RiderActiveDeliveryPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionKind, setActionKind] = useState<"deliver" | "accept" | "reject" | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await getRiderShipments("active");
    if (res.success && res.data) {
      setShipments(res.data);
      return;
    }
    if (res.message?.toLowerCase().includes("rider access") || res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(res.message || "Could not load deliveries.");
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

  useEffect(() => {
    const t = setInterval(() => {
      void load();
    }, 15_000);
    return () => clearInterval(t);
  }, [load]);

  async function handleMarkDelivered(id: string) {
    setActionMessage("");
    setActionId(id);
    setActionKind("deliver");
    const res = await markShipmentDelivered(id);
    setActionId(null);
    setActionKind(null);
    if (res.success) {
      setActionMessage("Marked as delivered.");
      await load();
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setActionMessage(res.message || "Could not update shipment.");
  }

  async function handleAccept(id: string) {
    setActionMessage("");
    setActionId(id);
    setActionKind("accept");
    const res = await acceptRiderShipmentOffer(id);
    setActionId(null);
    setActionKind(null);
    if (res.success) {
      setActionMessage("Offer accepted. You can complete the delivery when ready.");
      await load();
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setActionMessage(res.message || "Could not accept offer.");
    await load();
  }

  async function handleReject(id: string) {
    setActionMessage("");
    setActionId(id);
    setActionKind("reject");
    const res = await rejectRiderShipmentOffer(id);
    setActionId(null);
    setActionKind(null);
    if (res.success) {
      setActionMessage("Offer declined.");
      await load();
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setActionMessage(res.message || "Could not decline offer.");
    await load();
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Active delivery</h1>
        <p className="mt-4 text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Active delivery</h1>
        <p className="mt-2 text-sm text-neutral-600">
          New offers must be accepted within 3 minutes or they will go to another rider. Accept to commit, or decline to pass.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      {actionMessage && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            actionMessage.startsWith("Marked") || actionMessage.startsWith("Offer accepted")
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
          role="status"
        >
          {actionMessage}
        </div>
      )}

      {shipments.length === 0 ? (
        <p className="text-sm text-neutral-500">You do not have an active delivery right now.</p>
      ) : (
        <ul className="space-y-4">
          {shipments.map((s) => {
            const awaiting = s.status === AWAITING;
            const busy =
              actionId === s._id &&
              (actionKind === "deliver" || actionKind === "accept" || actionKind === "reject");
            return (
              <li
                key={s._id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Shipment</span>
                  <span className="rounded-full bg-[#81007f]/10 px-2.5 py-0.5 text-xs font-medium text-[#81007f]">
                    {formatStatus(s.status)}
                  </span>
                </div>
                {awaiting && s.riderResponseDeadline && (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Respond by {formatDeadline(s.riderResponseDeadline)} or this offer will move to another rider.
                  </p>
                )}
                <p className="text-sm text-neutral-600">
                  <span className="font-medium text-neutral-800">Price:</span> ₦{s.price.toLocaleString()} ·{" "}
                  <span className="font-medium text-neutral-800">Payment:</span> {s.paymentStatus}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="font-semibold text-[#81007f]">Pickup (sender)</p>
                    <p className="text-neutral-800">{s.senderDetails.fullName}</p>
                    <p className="text-neutral-600">{s.senderDetails.address}</p>
                    <p className="text-neutral-600">{s.senderDetails.phone}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#81007f]">Delivery (recipient)</p>
                    <p className="text-neutral-800">{s.recipientDetails.fullName}</p>
                    <p className="text-neutral-600">{s.recipientDetails.address}</p>
                    <p className="text-neutral-600">{s.recipientDetails.phone}</p>
                  </div>
                </div>
                <div className="text-sm text-neutral-600">
                  <p>
                    <span className="font-medium text-neutral-800">Package:</span> {s.packageDetails.type} ·{" "}
                    {s.packageDetails.weight} kg · qty {s.packageDetails.quantity}
                  </p>
                  {s.packageDetails.note ? <p className="mt-1">Note: {s.packageDetails.note}</p> : null}
                </div>
                {awaiting ? (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleAccept(s._id)}
                      disabled={busy}
                      className="min-h-[44px] flex-1 rounded-lg bg-[#81007f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6a0068] disabled:opacity-60"
                    >
                      {busy && actionKind === "accept" ? "Accepting…" : "Accept"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(s._id)}
                      disabled={busy}
                      className="min-h-[44px] flex-1 rounded-lg border-2 border-neutral-400 px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
                    >
                      {busy && actionKind === "reject" ? "Declining…" : "Decline"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMarkDelivered(s._id)}
                    disabled={busy}
                    className="min-h-[44px] w-full sm:w-auto rounded-lg bg-[#81007f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6a0068] disabled:opacity-60"
                  >
                    {busy && actionKind === "deliver" ? "Updating…" : "Mark as delivered"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
