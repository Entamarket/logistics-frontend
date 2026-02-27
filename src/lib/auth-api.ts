import { apiPost } from "./api";

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
  phone: string;
  password: string;
}

export interface LoginBody {
  email: string;
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
} as const;

export async function signUp(body: SignUpBody) {
  return apiPost<{ id: string; firstName: string; lastName: string; email: string; role: string }>(
    "/api/auth/signup",
    body
  );
}

export async function login(body: LoginBody) {
  return apiPost<AuthUser>("/api/auth/login", body);
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
