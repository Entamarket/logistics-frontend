"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);
    if (res.success && res.data) {
      const role = res.data.role;
      const path =
        role === "admin"
          ? "/admin"
          : role === "rider"
            ? "/rider"
            : "/dashboard";
      router.push(path);
      router.refresh();
      return;
    }
    setError(res.message);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Log in</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error && (
          <div
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
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
            className="mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 placeholder-neutral-400 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[#81007f] hover:underline sm:order-2"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 placeholder-neutral-400 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] rounded-lg bg-[#81007f] px-4 py-3 font-medium text-white transition hover:bg-[#6a0068] active:bg-[#5a0058] focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-medium text-[#81007f] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
