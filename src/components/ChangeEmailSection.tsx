"use client";

import { useState } from "react";
import {
  confirmEmailChange,
  requestEmailChange,
  resendEmailChangeOTP,
  type UserProfile,
} from "@/lib/auth-api";

const defaultInputClass =
  "mt-1.5 block w-full min-h-[44px] rounded-xl border border-purple-200/70 bg-white px-4 py-2.5 text-base text-neutral-900 shadow-sm placeholder:text-neutral-500 transition focus:border-[#81007f] focus:outline-none focus:ring-2 focus:ring-[#81007f]/30";
const defaultLabelClass = "block text-sm font-semibold text-neutral-800";
const defaultCardClass =
  "overflow-hidden rounded-2xl border border-purple-100/90 bg-white shadow-lg shadow-purple-500/10";
const defaultBtnClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#81007f] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-[#6a0068] focus:outline-none focus:ring-2 focus:ring-[#81007f]/40 disabled:cursor-not-allowed disabled:opacity-60";
const defaultBtnSecondaryClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#81007f] transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60";

export interface ChangeEmailSectionProps {
  currentEmail: string;
  onEmailChanged: (profile: UserProfile) => void;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  cardClassName?: string;
  buttonClassName?: string;
  secondaryButtonClassName?: string;
}

export function ChangeEmailSection({
  currentEmail,
  onEmailChanged,
  className,
  inputClassName = defaultInputClass,
  labelClassName = defaultLabelClass,
  cardClassName = defaultCardClass,
  buttonClassName = defaultBtnClass,
  secondaryButtonClassName = defaultBtnSecondaryClass,
}: ChangeEmailSectionProps) {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  function resetToRequest() {
    setStep("request");
    setOtp("");
    setPendingEmail("");
    setCurrentPassword("");
    setError("");
    setSuccess("");
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const res = await requestEmailChange({ newEmail, currentPassword });
    setLoading(false);
    if (res.success && res.data) {
      setPendingEmail(res.data.pendingEmail);
      setStep("confirm");
      setSuccess(res.message || "A verification code has been sent to your new email.");
      setCurrentPassword("");
      return;
    }
    setError(res.message || "Could not start email change.");
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const res = await confirmEmailChange({ otp });
    setLoading(false);
    if (res.success && res.data) {
      onEmailChanged(res.data);
      setNewEmail("");
      setOtp("");
      setPendingEmail("");
      setStep("request");
      setSuccess("Your email has been updated.");
      return;
    }
    setError(res.message || "Could not confirm email change.");
  }

  async function handleResend() {
    setError("");
    setSuccess("");
    setResendLoading(true);
    const res = await resendEmailChangeOTP();
    setResendLoading(false);
    if (res.success && res.data) {
      setPendingEmail(res.data.pendingEmail);
      setSuccess(res.message || "A new verification code has been sent.");
      return;
    }
    setError(res.message || "Could not resend code.");
  }

  return (
    <section className={className ?? cardClassName}>
      <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
      <div className="space-y-4 p-5">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Change email</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Confirm with your current password. We will send a verification code to the new address.
          </p>
        </div>

        <div className="rounded-lg bg-purple-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#81007f]/80">Current email</p>
          <p className="mt-1 break-all text-sm font-medium text-neutral-900">{currentEmail}</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
          >
            {success}
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label htmlFor="change-email-new" className={labelClassName}>
                New email
              </label>
              <input
                id="change-email-new"
                type="email"
                required
                autoComplete="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={inputClassName}
                disabled={loading}
                placeholder="new@example.com"
              />
            </div>
            <div>
              <label htmlFor="change-email-password" className={labelClassName}>
                Current password
              </label>
              <input
                id="change-email-password"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClassName}
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading} className={buttonClassName}>
              {loading ? "Sending code…" : "Send verification code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4">
            <p className="text-sm text-neutral-600">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-neutral-900 break-all">{pendingEmail || newEmail}</span>.
            </p>
            <div>
              <label htmlFor="change-email-otp" className={labelClassName}>
                Verification code
              </label>
              <input
                id="change-email-otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={inputClassName}
                disabled={loading}
                placeholder="123456"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button type="submit" disabled={loading || otp.length < 6} className={buttonClassName}>
                {loading ? "Confirming…" : "Confirm new email"}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || loading}
                className={secondaryButtonClassName}
              >
                {resendLoading ? "Resending…" : "Resend code"}
              </button>
              <button
                type="button"
                onClick={resetToRequest}
                disabled={loading || resendLoading}
                className="text-sm font-semibold text-neutral-600 hover:underline disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
