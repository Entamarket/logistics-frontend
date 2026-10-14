"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { getShipmentTracking, type ShipmentData } from "@/lib/shipment-api";
import { ShipmentMap } from "./ShipmentMap";

function toMapLatLng(lon?: number, lat?: number) {
  if (lon == null || lat == null || Number.isNaN(lon) || Number.isNaN(lat)) return null;
  return { lng: lon, lat };
}

function clientActiveLeg(status: string): "to_pickup" | "to_dropoff" {
  if (status === "picked_up" || status === "in_transit") return "to_dropoff";
  return "to_pickup";
}

export function ClientActiveShipmentMap({
  shipment,
  height = "260px",
}: {
  shipment: ShipmentData;
  height?: string;
}) {
  const { riderLocationByShipmentId } = useNotifications();
  const ws = riderLocationByShipmentId[shipment._id];
  const [polled, setPolled] = useState<{ longitude: number; latitude: number } | null>(null);
  const hasRider = Boolean(shipment.riderID);

  useEffect(() => {
    if (!hasRider) return;
    let cancelled = false;
    async function poll() {
      const res = await getShipmentTracking(shipment._id);
      if (cancelled || !res.success || !res.data?.rider) return;
      setPolled({
        longitude: res.data.rider.longitude,
        latitude: res.data.rider.latitude,
      });
    }
    void poll();
    const t = setInterval(poll, 20_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [shipment._id, hasRider]);

  const riderMapPos = !hasRider
    ? null
    : ws
      ? { lat: ws.latitude, lng: ws.longitude }
      : polled
        ? { lat: polled.latitude, lng: polled.longitude }
        : null;

  const pickup = toMapLatLng(shipment.pickupLongitude, shipment.pickupLatitude);
  const recipient = toMapLatLng(shipment.recipientLongitude, shipment.recipientLatitude);

  const leg = clientActiveLeg(shipment.status);

  const journeyLabel = !hasRider
    ? "A rider has not been assigned yet. The map shows your pickup and drop-off points."
    : leg === "to_pickup"
      ? "Rider is heading to the pickup address."
      : "Rider is heading to the drop-off address.";

  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-600">{journeyLabel}</p>
      <ShipmentMap
        pickup={pickup}
        recipient={recipient}
        rider={riderMapPos}
        recipientAddress={recipient ? undefined : shipment.recipientDetails.address}
        activeLeg={leg}
        showDirections
        height={height}
      />
    </div>
  );
}
