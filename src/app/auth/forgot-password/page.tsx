"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await forgotPassword({ email });
    setLoading(false);
    if (res.success) {
      setSent(true);
      return;
    }
    setError(res.message);
  }

  if (sent) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Check your email</h1>
          <p className="mt-2 text-sm text-neutral-600 break-words">
            If an account exists for <strong className="break-all">{email}</strong>, we&apos;ve sent a password reset
            code. Use it on the next screen.
          </p>
        </div>
        <Link
          href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
          className="block w-full min-h-[44px] rounded-lg bg-[#81007f] px-4 py-3 text-center font-medium text-white transition hover:bg-[#6a0068] active:bg-[#5a0058] flex items-center justify-center"
        >
          Enter reset code
        </Link>
        <p className="text-center text-sm text-neutral-600">
          <Link href="/auth/login" className="font-medium text-[#81007f] hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Forgot password</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Enter your email and we&apos;ll send you a reset code
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] rounded-lg bg-[#81007f] px-4 py-3 font-medium text-white transition hover:bg-[#6a0068] active:bg-[#5a0058] focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset code"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/auth/login" className="font-medium text-[#81007f] hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
