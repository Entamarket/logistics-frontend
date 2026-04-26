import { apiGet, apiPost } from "./api";

export interface FeedbackData {
  _id: string;
  clientUserId: string;
  riderId: string;
  shipmentId: string;
  rating: number;
  comment: string;
  riderName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackPayload {
  shipmentId: string;
  rating: number;
  comment?: string;
}

export async function createFeedback(payload: CreateFeedbackPayload) {
  return apiPost<FeedbackData>("/api/feedback", payload);
}

export async function getMyFeedback() {
  return apiGet<FeedbackData[]>("/api/feedback/mine");
}
