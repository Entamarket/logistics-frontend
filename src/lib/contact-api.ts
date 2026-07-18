import { apiPost } from "./api";

export interface SubmitContactMessageBody {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
}

export interface ContactMessageData {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  readAt: string | null;
  emailDeliveryStatus: string;
  createdAt: string;
  updatedAt: string;
}

export async function submitContactMessage(body: SubmitContactMessageBody) {
  return apiPost<ContactMessageData>("/api/contact/messages", body);
}
