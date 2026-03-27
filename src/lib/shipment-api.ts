import { apiGet, apiPatch, apiPost } from "./api";

export interface CreateShipmentPayload {
  deliveryType: "instant" | "scheduled";
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  /** Required for instant delivery (WGS84). Used to match the nearest rider. */
  pickupLongitude?: number;
  pickupLatitude?: number;
  senderDetails: { fullName: string; address: string; phone: string };
  recipientDetails: { fullName: string; address: string; phone: string };
  packageDetails: {
    type: string;
    weight: number;
    dimensions: number;
    quantity: number;
    note?: string;
  };
}

export interface ShipmentData {
  _id: string;
  userId: string;
  status: string;
  deliveryType: string;
  pickupDate?: string;
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  pickupLongitude?: number;
  pickupLatitude?: number;
  riderResponseDeadline?: string;
  declinedRiderIds?: string[];
  riderID?: string | null;
  price: number;
  paymentStatus: string;
  timeline: { status: string; timestamp: string }[];
  senderDetails: { fullName: string; address: string; phone: string };
  recipientDetails: { fullName: string; address: string; phone: string };
  packageDetails: { type: string; weight: number; dimensions: number; quantity: number; note?: string };
  createdAt: string;
  updatedAt: string;
}

export async function getShipments() {
  return apiGet<ShipmentData[]>("/api/shipments");
}

/** Rider-only: shipments assigned to the logged-in rider. scope=active|history|all */
export async function getRiderShipments(scope: "active" | "history" | "all" = "active") {
  const q = scope === "active" ? "" : `?scope=${encodeURIComponent(scope)}`;
  return apiGet<ShipmentData[]>(`/api/shipments/rider/me${q}`);
}

export async function createShipment(payload: CreateShipmentPayload) {
  return apiPost<ShipmentData>("/api/shipments", payload);
}

export async function markShipmentDelivered(shipmentId: string) {
  return apiPatch<ShipmentData>(`/api/shipments/${shipmentId}/delivered`, {});
}

export async function acceptRiderShipmentOffer(shipmentId: string) {
  return apiPatch<ShipmentData>(`/api/shipments/${shipmentId}/rider/accept`, {});
}

export async function rejectRiderShipmentOffer(shipmentId: string) {
  return apiPatch<ShipmentData>(`/api/shipments/${shipmentId}/rider/reject`, {});
}
