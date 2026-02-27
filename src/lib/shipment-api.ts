import { apiGet, apiPost } from "./api";

export interface CreateShipmentPayload {
  deliveryType: "instant" | "scheduled";
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
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

export async function createShipment(payload: CreateShipmentPayload) {
  return apiPost<ShipmentData>("/api/shipments", payload);
}
