import { apiGet, apiPatch, apiPost } from "./api";

export interface CreateShipmentPayload {
  deliveryType: "instant" | "scheduled";
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  /** Required for instant delivery (WGS84). Used to match the nearest rider. */
  pickupLongitude?: number;
  pickupLatitude?: number;
  /** Optional drop-off coordinates for maps (both or neither). */
  recipientLongitude?: number;
  recipientLatitude?: number;
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
  recipientLongitude?: number;
  recipientLatitude?: number;
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

export interface RiderAddressBookEntry {
  role: "sender" | "recipient";
  fullName: string;
  address: string;
  phone: string;
  lastSeenAt: string;
}

/** Rider-only: deduped sender and recipient addresses from assigned shipments. */
export async function getRiderAddressBook() {
  return apiGet<RiderAddressBookEntry[]>("/api/shipments/rider/me/address-book");
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

export interface ShipmentTrackingData {
  shipmentId: string;
  status: string;
  pickup: { longitude: number; latitude: number } | null;
  recipient: { longitude: number; latitude: number } | null;
  rider: { longitude: number; latitude: number } | null;
  riderLocationUpdatedAt: string | null;
}

export async function getShipmentTracking(shipmentId: string) {
  return apiGet<ShipmentTrackingData>(`/api/shipments/${shipmentId}/tracking`);
}

export async function markShipmentPickedUp(shipmentId: string) {
  return apiPatch<ShipmentData>(`/api/shipments/${shipmentId}/picked-up`, {});
}

export async function markShipmentInTransit(shipmentId: string) {
  return apiPatch<ShipmentData>(`/api/shipments/${shipmentId}/in-transit`, {});
}
