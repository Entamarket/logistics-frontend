/** Human-readable labels for shipment lifecycle statuses. */
export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  searching_rider: "Searching for rider",
  awaiting_rider_response: "Awaiting rider response",
  rider_assigned: "Rider assigned",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function formatShipmentStatus(status: string): string {
  return SHIPMENT_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

/** Tailwind classes for landing-page status chips. */
export function landingShipmentStatusClass(status: string): string {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold capitalize ring-1";
  switch (status) {
    case "delivered":
      return `${base} bg-emerald-50 text-emerald-800 ring-emerald-200/80`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
      return `${base} bg-blue-50 text-blue-800 ring-blue-200/80`;
    case "searching_rider":
    case "awaiting_rider_response":
      return `${base} bg-violet-50 text-violet-800 ring-violet-200/80`;
    case "scheduled":
    case "pending":
      return `${base} bg-amber-50 text-amber-900 ring-amber-200/80`;
    case "cancelled":
      return `${base} bg-red-50 text-red-800 ring-red-200/80`;
    default:
      return `${base} bg-neutral-50 text-neutral-800 ring-neutral-200/80`;
  }
}
