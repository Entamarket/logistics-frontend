import { apiGet, apiPatch, apiPost } from "./api";

export interface ContactDetailsPayload {
  fullName: string;
  address: string;
  phone: string;
  country: string;
  state: string;
}

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
  senderDetails: ContactDetailsPayload;
  recipientDetails: ContactDetailsPayload;
  packageDetails: {
    type: string;
    weight: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
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
  senderDetails: Omit<ContactDetailsPayload, "country" | "state"> & {
    country?: string;
    state?: string;
  };
  recipientDetails: Omit<ContactDetailsPayload, "country" | "state"> & {
    country?: string;
    state?: string;
  };
  packageDetails: {
    type: string;
    weight: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    quantity: number;
    note?: string;
  };
  createdAt: string;
  updatedAt: string;
  /** Set when an admin created the shipment on behalf of a client. */
  createdByAdmin?: boolean;
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

export type DimensionCategory = "small" | "medium" | "large" | "extraLarge";

export interface ShipmentPriceEstimate {
  currency: "NGN";
  baseFee: number;
  distanceMeters: number;
  distanceKm: number;
  distanceFee: number;
  weightFee: number;
  volumeCm3: number;
  dimensionCategory: DimensionCategory;
  dimensionFee: number;
  total: number;
}

export interface EstimateShipmentPricePayload {
  senderDetails?: ContactDetailsPayload;
  recipientDetails: ContactDetailsPayload;
  weight: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  pickupLongitude?: number;
  pickupLatitude?: number;
}

export function dimensionCategoryLabel(category: DimensionCategory): string {
  const labels: Record<DimensionCategory, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    extraLarge: "Extra large",
  };
  return labels[category] ?? category;
}

export async function estimateShipmentPrice(payload: EstimateShipmentPricePayload) {
  return apiPost<ShipmentPriceEstimate>("/api/shipments/estimate-price", payload);
}

export interface ShipmentPaymentInit {
  accessCode: string;
  reference: string;
  amountKobo: number;
  publicKey: string;
  email: string;
  alreadyPaid?: boolean;
}

export async function createShipment(payload: CreateShipmentPayload) {
  return apiPost<ShipmentData>("/api/shipments", payload);
}

export async function initializeShipmentPayment(shipmentId: string) {
  return apiPost<ShipmentPaymentInit>(`/api/shipments/${shipmentId}/payment/initialize`, {});
}

export async function verifyShipmentPayment(shipmentId: string, reference: string) {
  return apiPost<ShipmentData>(`/api/shipments/${shipmentId}/payment/verify`, { reference });
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

export interface PublicShipmentStatus {
  shipmentId: string;
  status: string;
  deliveryType: string;
  updatedAt: string;
}

/** Public lookup — no login required (landing page tracker). */
export async function getPublicShipmentStatus(shipmentId: string) {
  const trimmed = shipmentId.trim().replace(/^#/, "");
  return apiGet<PublicShipmentStatus>(`/api/shipments/track/${encodeURIComponent(trimmed)}`);
}

export async function markShipmentPickedUp(shipmentId: string) {
  return apiPatch<ShipmentData>(`/api/shipments/${shipmentId}/picked-up`, {});
}

export async function markShipmentInTransit(shipmentId: string) {
  return apiPatch<ShipmentData>(`/api/shipments/${shipmentId}/in-transit`, {});
}
