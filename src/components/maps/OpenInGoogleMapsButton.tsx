"use client";

type LatLng = { lat: number; lng: number };

function buildDirectionsUrl(origin: LatLng | null, destination: LatLng | null, destinationQuery?: string) {
  const params = new URLSearchParams({ api: "1" });
  if (origin) {
    params.set("origin", `${origin.lat},${origin.lng}`);
  }
  if (destination) {
    params.set("destination", `${destination.lat},${destination.lng}`);
  } else if (destinationQuery) {
    params.set("destination", destinationQuery);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function OpenInGoogleMapsButton({
  origin,
  destination,
  destinationQuery,
  label,
  className = "",
}: {
  origin?: LatLng | null;
  destination?: LatLng | null;
  destinationQuery?: string;
  label: string;
  className?: string;
}) {
  const dest = destination ?? null;
  const href = buildDirectionsUrl(origin ?? null, dest, destinationQuery);
  const disabled = !dest && !destinationQuery;

  return (
    <a
      href={disabled ? undefined : href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-[40px] items-center justify-center rounded-lg border border-[#81007f] px-3 py-2 text-sm font-medium text-[#81007f] hover:bg-[#81007f]/5 ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`}
      aria-disabled={disabled}
    >
      {label}
    </a>
  );
}
