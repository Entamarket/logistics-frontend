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
import { formatWeightRangeLabel } from "@/lib/shipment-weight-tiers";
import { formatPackageSizeLabel } from "@/lib/shipment-size-tiers";
import { ShipmentMap } from "@/components/maps/ShipmentMap";
import { OpenInGoogleMapsButton } from "@/components/maps/OpenInGoogleMapsButton";
import {
  RiderEmptyState,
  RiderErrorAlert,
  RiderLoadingBlock,
  RiderPageHeader,
  RiderShell,
  RiderSuccessAlert,
  RiderWarningAlert,
  riderBtnAccent,
  riderBtnPrimary,
  riderBtnSecondary,
  riderCard,
  riderCardAccentPurple,
  riderNeonBoxAmber,
  riderNeonBoxPurple,
  riderStatusBadge,
} from "@/components/rider/RiderUI";

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

  function TruckIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0h4m-4 0a2 2 0 104 0m6 0a2 2 0 104 0M5 16H3m2-8h2m10 0h2"
        />
      </svg>
    );
  }

  if (loading) {
    return (
      <RiderShell className="max-w-4xl">
        <div className="space-y-6">
          <RiderPageHeader
            badge="On route"
            title="Active deliveries"
            description="Loading your current jobs…"
            icon={<TruckIcon className="h-6 w-6" />}
          />
          <RiderLoadingBlock label="Loading active deliveries…" />
        </div>
      </RiderShell>
    );
  }

  const actionIsSuccess =
    actionMessage.startsWith("Marked") || actionMessage.startsWith("Offer accepted");

  return (
    <RiderShell className="max-w-4xl">
      <div className="space-y-6">
        <RiderPageHeader
          badge="On route"
          title="Active deliveries"
          description="You may have several jobs at once. New offers must be accepted within 3 minutes or they go to another rider. Your location is shared with senders while you have active jobs (about every 15 seconds)."
          icon={<TruckIcon className="h-6 w-6" />}
        />

        {error && <RiderErrorAlert>{error}</RiderErrorAlert>}
        {actionMessage &&
          (actionIsSuccess ? (
            <RiderSuccessAlert>{actionMessage}</RiderSuccessAlert>
          ) : (
            <RiderWarningAlert>{actionMessage}</RiderWarningAlert>
          ))}

        {shipments.length === 0 ? (
          <RiderEmptyState
            icon={<TruckIcon className="h-7 w-7" />}
            title="No active deliveries"
            description="When you accept jobs they will show up here with route, contacts, and status actions."
          />
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
              <li key={s._id} className={`${riderCard} space-y-0`}>
                <div className={riderCardAccentPurple} aria-hidden />
                <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipment</span>
                  <span className={riderStatusBadge(s.status)}>{formatStatus(s.status)}</span>
                </div>
                {awaiting && s.riderResponseDeadline && (
                  <RiderWarningAlert>
                    Respond by {formatDeadline(s.riderResponseDeadline)} or this offer will move to another rider.
                  </RiderWarningAlert>
                )}
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Price:</span> ₦{s.price.toLocaleString()} ·{" "}
                  <span className="font-semibold text-slate-800">Payment:</span> {s.paymentStatus}
                </p>

                {showMap && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#81007f]">Route</p>
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
                  <div className={riderNeonBoxAmber}>
                    <p className="font-bold text-amber-900">Pickup (sender)</p>
                    <p className="mt-1 text-slate-800">{s.senderDetails.fullName}</p>
                    <p className="text-slate-600">{s.senderDetails.address}</p>
                    <p className="text-slate-600">{s.senderDetails.phone}</p>
                  </div>
                  <div className={riderNeonBoxPurple}>
                    <p className="font-bold text-[#6a0068]">Delivery (recipient)</p>
                    <p className="mt-1 text-slate-800">{s.recipientDetails.fullName}</p>
                    <p className="text-slate-600">{s.recipientDetails.address}</p>
                    <p className="text-slate-600">{s.recipientDetails.phone}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">Package:</span> {s.packageDetails.type} ·{" "}
                    {formatWeightRangeLabel(s.packageDetails.weight)} ·{" "}
                    {formatPackageSizeLabel(
                      s.packageDetails.lengthCm,
                      s.packageDetails.widthCm,
                      s.packageDetails.heightCm
                    )}{" "}
                    · qty {s.packageDetails.quantity}
                  </p>
                  {s.packageDetails.note ? <p className="mt-1">Note: {s.packageDetails.note}</p> : null}
                </div>
                {awaiting ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleAccept(s._id)}
                      disabled={busy}
                      className={`${riderBtnPrimary} flex-1`}
                    >
                      {busy && actionKind === "accept" ? "Accepting…" : "Accept"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(s._id)}
                      disabled={busy}
                      className={`${riderBtnSecondary} flex-1`}
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
                        className={riderBtnSecondary}
                      >
                        {busy && actionKind === "picked_up" ? "Updating…" : "Mark picked up"}
                      </button>
                    ) : null}
                    {s.status === "picked_up" ? (
                      <button
                        type="button"
                        onClick={() => handleInTransit(s._id)}
                        disabled={busy}
                        className={riderBtnSecondary}
                      >
                        {busy && actionKind === "in_transit" ? "Updating…" : "Mark in transit"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleMarkDelivered(s._id)}
                      disabled={busy}
                      className={`${riderBtnAccent} w-full sm:w-auto`}
                    >
                      {busy && actionKind === "deliver" ? "Updating…" : "Mark as delivered"}
                    </button>
                  </div>
                )}
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
