"use client";

import Link from "next/link";
import { useState } from "react";
import { changePassword } from "@/lib/auth-api";

const defaultInputClass =
  "mt-1.5 block w-full min-h-[44px] rounded-xl border border-purple-200/70 bg-white px-4 py-2.5 text-base text-neutral-900 shadow-sm placeholder:text-neutral-500 transition focus:border-[#81007f] focus:outline-none focus:ring-2 focus:ring-[#81007f]/30";
const defaultLabelClass = "block text-sm font-semibold text-neutral-800";
const defaultCardClass =
  "overflow-hidden rounded-2xl border border-purple-100/90 bg-white shadow-lg shadow-purple-500/10";
const defaultBtnClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#81007f] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-[#6a0068] focus:outline-none focus:ring-2 focus:ring-[#81007f]/40 disabled:cursor-not-allowed disabled:opacity-60";

export interface ChangePasswordSectionProps {
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  cardClassName?: string;
  buttonClassName?: string;
  showForgotLink?: boolean;
}

export function ChangePasswordSection({
  className,
  inputClassName = defaultInputClass,
  labelClassName = defaultLabelClass,
  cardClassName = defaultCardClass,
  buttonClassName = defaultBtnClass,
  showForgotLink = true,
}: ChangePasswordSectionProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    const res = await changePassword({ currentPassword, newPassword });
    setLoading(false);

    if (res.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(res.message || "Password updated successfully.");
      return;
    }
    setError(res.message || "Could not update password.");
  }

  return (
    <section className={className ?? cardClassName}>
      <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Change password</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Enter your current password and choose a new one. No email code is required.
          </p>
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

        <div>
          <label htmlFor="change-password-current" className={labelClassName}>
            Current password
          </label>
          <input
            id="change-password-current"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClassName}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="change-password-new" className={labelClassName}>
            New password
          </label>
          <input
            id="change-password-new"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClassName}
            disabled={loading}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label htmlFor="change-password-confirm" className={labelClassName}>
            Confirm new password
          </label>
          <input
            id="change-password-confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClassName}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className={buttonClassName}>
          {loading ? "Updating…" : "Update password"}
        </button>

        {showForgotLink && (
          <p className="text-sm text-neutral-600">
            Forgot your current password?{" "}
            <Link
              href="/auth/forgot-password"
              className="font-semibold text-[#81007f] underline-offset-2 hover:underline"
            >
              Reset via email
            </Link>
          </p>
        )}
      </form>
    </section>
  );
}
