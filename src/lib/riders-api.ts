import { apiPost, apiGet, apiPatch } from "./api";

export interface RiderUserRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface RiderLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface RiderData {
  _id: string;
  userId: RiderUserRef | string;
  status: string;
  isAvailable: boolean;
  isVerified: boolean;
  location?: RiderLocation;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRiderPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateRiderPayload {
  status?: string;
  isAvailable?: boolean;
  isVerified?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export async function createRider(payload: CreateRiderPayload) {
  return apiPost<RiderData>("/api/riders", payload);
}

export async function getRiders() {
  return apiGet<RiderData[]>("/api/riders");
}

export async function getRiderById(id: string) {
  return apiGet<RiderData>(`/api/riders/${id}`);
}

export async function updateRider(id: string, payload: UpdateRiderPayload) {
  return apiPatch<RiderData>(`/api/riders/${id}`, payload);
}

export async function updateRiderStatus(id: string, status: "active" | "suspended" | "blocked") {
  return apiPatch<RiderData>(`/api/riders/${id}/status`, { status });
}

/** Rider-only: current rider profile (includes location when set). */
export async function getMyRiderProfile() {
  return apiGet<RiderData>("/api/riders/me");
}

/** Rider-only: update current GPS position (GeoJSON: longitude, latitude). */
export async function updateMyRiderLocation(longitude: number, latitude: number) {
  return apiPatch<RiderData>("/api/riders/me/location", { longitude, latitude });
}

export function getRiderDisplayName(rider: RiderData): string {
  const user = typeof rider.userId === "object" && rider.userId ? rider.userId : null;
  if (user) return `${user.firstName} ${user.lastName}`.trim() || user.email;
  return "—";
}

export function getRiderUser(rider: RiderData): RiderUserRef | null {
  return typeof rider.userId === "object" && rider.userId ? rider.userId : null;
}
