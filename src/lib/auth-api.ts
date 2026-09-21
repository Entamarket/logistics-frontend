import { apiGet, apiPatch, apiPost } from "./api";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface SignUpBody {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginBody {
  /** Email address or phone number */
  identifier: string;
  password: string;
}

export interface VerifyEmailBody {
  email: string;
  otp: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  email: string;
  otp: string;
  newPassword: string;
}

export const AUTH_PURPOSES = {
  EMAIL_VERIFICATION: "Email verification",
  PASSWORD_RESET: "Password reset",
  EMAIL_CHANGE: "Email change",
} as const;

export async function signUp(body: SignUpBody) {
  return apiPost<{ id: string; firstName: string; lastName: string; email: string; role: string }>(
    "/api/auth/signup",
    body
  );
}

export async function login(body: LoginBody) {
  return apiPost<AuthUser | { email: string }>("/api/auth/login", body);
}

export async function verifyEmail(body: VerifyEmailBody) {
  return apiPost<AuthUser & { isEmailVerified: boolean }>("/api/auth/verify-email", body);
}

export async function forgotPassword(body: ForgotPasswordBody) {
  return apiPost<unknown>("/api/auth/forgot-password", body);
}

export async function resetPassword(body: ResetPasswordBody) {
  return apiPost<unknown>("/api/auth/reset-password", body);
}

export async function logout() {
  return apiPost<unknown>("/api/auth/logout", {});
}

export async function resendOTP(body: { email: string; purpose: string }) {
  return apiPost<unknown>("/api/auth/resend-otp", body);
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileBody {
  firstName: string;
  lastName: string;
  phone: string;
}

export async function getMyProfile() {
  return apiGet<UserProfile>("/api/auth/me");
}

export async function updateMyProfile(body: UpdateProfileBody) {
  return apiPatch<UserProfile>("/api/auth/me", body);
}

export async function requestEmailChange(body: { newEmail: string; currentPassword: string }) {
  return apiPost<{ pendingEmail: string }>("/api/auth/me/email/request", body);
}

export async function confirmEmailChange(body: { otp: string }) {
  return apiPost<UserProfile>("/api/auth/me/email/confirm", body);
}

export async function resendEmailChangeOTP() {
  return apiPost<{ pendingEmail: string }>("/api/auth/me/email/resend", {});
}

export async function changePassword(body: { currentPassword: string; newPassword: string }) {
  return apiPost<unknown>("/api/auth/me/password", body);
}

/** Permanently delete the authenticated account (requires password). */
export async function deleteMyAccount(body: { password: string }) {
  return apiPost<unknown>("/api/auth/me/delete", body);
}
