"use client";

import { useEffect, useRef } from "react";
import { useMap, useApiIsLoaded } from "@vis.gl/react-google-maps";

type LatLngLiteral = google.maps.LatLngLiteral;

export function DirectionsLayer({
  origin,
  destination,
  suppressMarkers = true,
}: {
  origin: LatLngLiteral | null;
  destination: LatLngLiteral | null;
  suppressMarkers?: boolean;
}) {
  const map = useMap();
  const isLoaded = useApiIsLoaded();
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!isLoaded || !map || !origin || !destination) {
      if (rendererRef.current) {
        rendererRef.current.setMap(null);
        rendererRef.current = null;
      }
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers,
      preserveViewport: false,
    });
    rendererRef.current = directionsRenderer;

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
        }
      }
    );

    return () => {
      directionsRenderer.setMap(null);
      rendererRef.current = null;
    };
  }, [isLoaded, map, origin?.lat, origin?.lng, destination?.lat, destination?.lng, suppressMarkers]);

  return null;
}
