"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword, resendOTP, AUTH_PURPOSES } from "@/lib/auth-api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const res = await resetPassword({ email, otp, newPassword });
    setLoading(false);
    if (res.success) {
      setSuccess("Password reset. Redirecting to login…");
      router.push("/auth/login");
      router.refresh();
      return;
    }
    setError(res.message);
  }

  async function handleResend() {
    setError("");
    setResendLoading(true);
    const res = await resendOTP({ email, purpose: AUTH_PURPOSES.PASSWORD_RESET });
    setResendLoading(false);
    if (res.success) setSuccess("A new code has been sent to your email.");
    else setError(res.message);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Reset password</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Enter the code from your email and your new password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-neutral-700">
            Reset code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            maxLength={6}
            className="mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-center text-base sm:text-lg tracking-widest text-neutral-900 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]"
            placeholder="000000"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]"
            placeholder="At least 8 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] rounded-lg bg-[#81007f] px-4 py-3 font-medium text-white transition hover:bg-[#6a0068] active:bg-[#5a0058] focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2 disabled:opacity-60"
        >
          {loading ? "Resetting…" : "Reset password"}
        </button>

        <p className="text-center text-sm text-neutral-600">
          Didn&apos;t get the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="font-medium text-[#81007f] hover:underline disabled:opacity-60"
          >
            {resendLoading ? "Sending…" : "Resend code"}
          </button>
        </p>
      </form>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/auth/login" className="font-medium text-[#81007f] hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-neutral-500">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
