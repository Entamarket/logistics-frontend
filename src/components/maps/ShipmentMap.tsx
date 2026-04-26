"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { APIProvider, Map, Marker, useApiIsLoaded } from "@vis.gl/react-google-maps";
import { DirectionsLayer } from "./DirectionsLayer";

export type MapLatLng = { lat: number; lng: number };

export type ShipmentMapProps = {
  pickup: MapLatLng | null;
  recipient: MapLatLng | null;
  rider: MapLatLng | null;
  /** Geocode drop-off when coordinates are missing (uses Maps JavaScript Geocoder). */
  recipientAddress?: string | null;
  activeLeg: "to_pickup" | "to_dropoff";
  /** When false, show markers and optional fit; no driving directions. */
  showDirections?: boolean;
  height?: string;
};

function GeocodeRecipient({
  address,
  onResult,
}: {
  address: string | null | undefined;
  onResult: (pos: MapLatLng | null) => void;
}) {
  const isLoaded = useApiIsLoaded();

  useEffect(() => {
    if (!isLoaded || !address?.trim()) {
      onResult(null);
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address.trim() }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        onResult({ lat: loc.lat(), lng: loc.lng() });
      } else {
        onResult(null);
      }
    });
  }, [isLoaded, address, onResult]);

  return null;
}

function ShipmentMapInner({
  pickup,
  recipient,
  rider,
  recipientAddress,
  activeLeg,
  showDirections = true,
  height = "280px",
}: ShipmentMapProps) {
  const [geocodedDropoff, setGeocodedDropoff] = useState<MapLatLng | null>(null);
  const onGeocoded = useCallback((pos: MapLatLng | null) => {
    setGeocodedDropoff(pos);
  }, []);

  const effectiveRecipient = recipient ?? geocodedDropoff;

  const center = useMemo(() => {
    if (rider) return rider;
    if (pickup) return pickup;
    if (effectiveRecipient) return effectiveRecipient;
    return { lat: 6.5244, lng: 3.3792 };
  }, [rider, pickup, effectiveRecipient]);

  const routeDestination = activeLeg === "to_pickup" ? pickup : effectiveRecipient;

  const canDirections =
    showDirections &&
    Boolean(rider) &&
    (activeLeg === "to_pickup" ? Boolean(pickup) : Boolean(effectiveRecipient));

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200" style={{ height }}>
      <GeocodeRecipient
        address={recipient ? undefined : recipientAddress}
        onResult={onGeocoded}
      />
      <Map
        defaultCenter={center}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: "100%", height: "100%" }}
        reuseMaps
      >
        {pickup ? <Marker position={pickup} title="Pickup" /> : null}
        {effectiveRecipient ? <Marker position={effectiveRecipient} title="Drop-off" /> : null}
        {rider ? <Marker position={rider} title="Rider" /> : null}
        {canDirections && rider && routeDestination ? (
          <DirectionsLayer origin={rider} destination={routeDestination} suppressMarkers />
        ) : null}
      </Map>
    </div>
  );
}

export function ShipmentMap(props: ShipmentMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600"
        style={{ minHeight: props.height ?? 280 }}
      >
        Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the map.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <ShipmentMapInner {...props} />
    </APIProvider>
  );
}
