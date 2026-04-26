"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getRiderShipments,
  markShipmentDelivered,
  acceptRiderShipmentOffer,
  rejectRiderShipmentOffer,
  markShipmentPickedUp,
  markShipmentInTransit,
  type ShipmentData,
} from "@/lib/shipment-api";
import { getMyRiderProfile, updateMyRiderLocation } from "@/lib/riders-api";
import { ShipmentMap } from "@/components/maps/ShipmentMap";
import { OpenInGoogleMapsButton } from "@/components/maps/OpenInGoogleMapsButton";

const AWAITING = "awaiting_rider_response";

const LOCATION_MIN_INTERVAL_MS = 15_000;

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

function toMapLatLng(lon?: number, lat?: number) {
  if (lon == null || lat == null || Number.isNaN(lon) || Number.isNaN(lat)) return null;
  return { lng: lon, lat };
}

function riderMapActiveLeg(status: string): "to_pickup" | "to_dropoff" {
  if (status === "picked_up" || status === "in_transit") return "to_dropoff";
  return "to_pickup";
}

export default function RiderActiveDeliveryPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionKind, setActionKind] = useState<
    "deliver" | "accept" | "reject" | "picked_up" | "in_transit" | null
  >(null);
  const [actionMessage, setActionMessage] = useState("");
  const [mePos, setMePos] = useState<{ lat: number; lng: number } | null>(null);
  const lastSentRef = useRef(0);
  const watchIdRef = useRef<number | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getMyRiderProfile();
      if (cancelled || !res.success || !res.data?.location?.coordinates) return;
      const [lng, lat] = res.data.location.coordinates;
      if (typeof lng === "number" && typeof lat === "number") {
        setMePos({ lng, lat });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (shipments.length === 0 || !navigator.geolocation) {
      return;
    }
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setMePos({ lng: longitude, lat: latitude });
        const now = Date.now();
        if (now - lastSentRef.current < LOCATION_MIN_INTERVAL_MS) return;
        lastSentRef.current = now;
        void updateMyRiderLocation(longitude, latitude);
      },
      () => {
        /* permission denied or error — keep last known mePos */
      },
      { enableHighAccuracy: true, maximumAge: 10_000 }
    );
    watchIdRef.current = id;
    return () => {
      navigator.geolocation.clearWatch(id);
      watchIdRef.current = null;
    };
  }, [shipments.length]);

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

  async function handlePickedUp(id: string) {
    setActionMessage("");
    setActionId(id);
    setActionKind("picked_up");
    const res = await markShipmentPickedUp(id);
    setActionId(null);
    setActionKind(null);
    if (res.success) {
      setActionMessage("Marked as picked up.");
      await load();
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setActionMessage(res.message || "Could not update shipment.");
    await load();
  }

  async function handleInTransit(id: string) {
    setActionMessage("");
    setActionId(id);
    setActionKind("in_transit");
    const res = await markShipmentInTransit(id);
    setActionId(null);
    setActionKind(null);
    if (res.success) {
      setActionMessage("Marked as in transit.");
      await load();
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setActionMessage(res.message || "Could not update shipment.");
    await load();
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Active delivery</h1>
        <p className="mt-4 text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Active delivery</h1>
        <p className="mt-2 text-sm text-neutral-600">
          New offers must be accepted within 3 minutes or they will go to another rider. Accept to commit, or decline to
          pass. Your location is shared with the sender while you have an active job (updates about every 15 seconds).
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
        <ul className="space-y-6">
          {shipments.map((s) => {
            const awaiting = s.status === AWAITING;
            const busy =
              actionId === s._id &&
              (actionKind === "deliver" ||
                actionKind === "accept" ||
                actionKind === "reject" ||
                actionKind === "picked_up" ||
                actionKind === "in_transit");
            const pickup = toMapLatLng(s.pickupLongitude, s.pickupLatitude);
            const recipient = toMapLatLng(s.recipientLongitude, s.recipientLatitude);
            const leg = riderMapActiveLeg(s.status);
            const showMap = Boolean(pickup || recipient || s.recipientDetails.address);

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

                {showMap && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#81007f] uppercase tracking-wide">Route</p>
                    <ShipmentMap
                      pickup={pickup}
                      recipient={recipient}
                      rider={mePos}
                      recipientAddress={recipient ? undefined : s.recipientDetails.address}
                      activeLeg={leg}
                      showDirections
                      height="320px"
                    />
                    <div className="flex flex-wrap gap-2">
                      {pickup ? (
                        <OpenInGoogleMapsButton
                          origin={mePos}
                          destination={pickup}
                          label="Open directions to pickup"
                        />
                      ) : null}
                      {recipient || s.recipientDetails.address ? (
                        <OpenInGoogleMapsButton
                          origin={mePos}
                          destination={recipient}
                          destinationQuery={recipient ? undefined : s.recipientDetails.address}
                          label="Open directions to drop-off"
                        />
                      ) : null}
                    </div>
                  </div>
                )}

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
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {s.status === "rider_assigned" ? (
                      <button
                        type="button"
                        onClick={() => handlePickedUp(s._id)}
                        disabled={busy}
                        className="min-h-[44px] rounded-lg border-2 border-[#81007f] px-4 py-2.5 text-sm font-medium text-[#81007f] hover:bg-[#81007f]/5 disabled:opacity-60"
                      >
                        {busy && actionKind === "picked_up" ? "Updating…" : "Mark picked up"}
                      </button>
                    ) : null}
                    {s.status === "picked_up" ? (
                      <button
                        type="button"
                        onClick={() => handleInTransit(s._id)}
                        disabled={busy}
                        className="min-h-[44px] rounded-lg border-2 border-[#81007f] px-4 py-2.5 text-sm font-medium text-[#81007f] hover:bg-[#81007f]/5 disabled:opacity-60"
                      >
                        {busy && actionKind === "in_transit" ? "Updating…" : "Mark in transit"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleMarkDelivered(s._id)}
                      disabled={busy}
                      className="min-h-[44px] w-full sm:w-auto rounded-lg bg-[#81007f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6a0068] disabled:opacity-60"
                    >
                      {busy && actionKind === "deliver" ? "Updating…" : "Mark as delivered"}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
