"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyProfile, updateMyProfile, type UserProfile } from "@/lib/auth-api";

const inputClass =
  "mt-1.5 block w-full min-h-[44px] rounded-xl border border-purple-200/70 bg-white px-4 py-2.5 text-base text-neutral-900 shadow-sm placeholder:text-neutral-500 transition focus:border-[#81007f] focus:outline-none focus:ring-2 focus:ring-[#81007f]/30 focus:shadow-[0_0_0_3px_rgba(129,0,127,0.12)]";
const labelClass = "block text-sm font-semibold text-neutral-800";

const cardClass =
  "overflow-hidden rounded-2xl border border-purple-100/90 bg-white shadow-lg shadow-purple-500/10";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function statusLabel(status: string): string {
  if (status === "suspended") return "Suspended";
  if (status === "blocked") return "Blocked";
  return "Active";
}

function statusClass(status: string): string {
  const base = "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full capitalize shadow-sm";
  if (status === "active")
    return `${base} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80 shadow-[0_0_10px_rgba(16,185,129,0.25)]`;
  if (status === "suspended")
    return `${base} bg-amber-100 text-amber-800 ring-1 ring-amber-200/80 shadow-[0_0_10px_rgba(245,158,11,0.25)]`;
  return `${base} bg-red-100 text-red-800 ring-1 ring-red-200/80 shadow-[0_0_10px_rgba(239,68,68,0.25)]`;
}

function profileInitials(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  const combined = `${a}${b}`.toUpperCase();
  return combined || "?";
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

export default function ProfileSettingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await getMyProfile();
    if (res.success && res.data) {
      setProfile(res.data);
      setFirstName(res.data.firstName);
      setLastName(res.data.lastName);
      setPhone(res.data.phone);
      return;
    }
    const msg = res.message || "Failed to load profile";
    if (msg.toLowerCase().includes("auth") || msg.toLowerCase().includes("suspended") || msg.toLowerCase().includes("blocked")) {
      router.replace("/auth/login");
      return;
    }
    setError(msg);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    const res = await updateMyProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    });
    setSaving(false);
    if (res.success && res.data) {
      setProfile(res.data);
      setFirstName(res.data.firstName);
      setLastName(res.data.lastName);
      setPhone(res.data.phone);
      setSuccess("Your profile has been updated.");
      return;
    }
    const msg = res.message || "Failed to update profile";
    if (msg.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(msg);
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6" aria-busy="true" aria-label="Loading profile">
        <div className="h-28 animate-pulse rounded-2xl border border-purple-100/60 bg-gradient-to-r from-purple-200/50 via-purple-50/80 to-fuchsia-100/60 shadow-md shadow-purple-500/10" />
        <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-gradient-to-br from-purple-200/80 via-[#81007f]/20 to-fuchsia-200/70 shadow-lg shadow-purple-500/20" />
        <div className={`${cardClass} animate-pulse`}>
          <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
          <div className="space-y-4 p-5">
            <div className="h-5 w-40 rounded-lg bg-gradient-to-r from-purple-200/70 to-fuchsia-100/60" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/80"
                />
              ))}
            </div>
          </div>
        </div>
        <div className={`${cardClass} animate-pulse`}>
          <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
          <div className="space-y-4 p-5">
            <div className="h-5 w-36 rounded-lg bg-gradient-to-r from-purple-200/70 to-fuchsia-100/60" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 rounded bg-purple-100/80" />
                <div className="h-11 rounded-xl bg-gradient-to-r from-purple-100/60 via-white to-purple-100/60" />
              </div>
            ))}
            <div className="h-11 w-32 rounded-xl bg-gradient-to-r from-[#81007f]/30 to-fuchsia-300/40 shadow-md shadow-purple-500/20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-[#81007f]/8 via-white to-fuchsia-50/40 px-5 py-5 shadow-md shadow-purple-500/10">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#81007f]/10 blur-2xl" aria-hidden />
        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#81007f] text-white shadow-lg shadow-purple-900/25">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Profile setting</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Manage your account details and keep your contact information up to date.
            </p>
          </div>
        </div>
      </div>

      {profile && (
        <div className="flex justify-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#81007f] to-fuchsia-500 text-2xl font-bold text-white shadow-xl shadow-purple-900/30 ring-4 ring-white"
            aria-hidden
          >
            {profileInitials(profile.firstName, profile.lastName)}
          </div>
        </div>
      )}

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md shadow-red-500/10"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-md shadow-emerald-500/10"
          role="status"
        >
          {success}
        </div>
      )}

      {profile && (
        <section className={cardClass}>
          <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
          <div className="p-5">
            <h2 className="text-base font-semibold text-neutral-900">Account overview</h2>
            <p className="mt-1 text-sm text-neutral-500">Your account status and membership details.</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-purple-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#81007f]/80">Email</dt>
                <dd className="mt-1 text-sm font-medium text-neutral-900 break-all">{profile.email}</dd>
              </div>
              <div className="rounded-lg bg-purple-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#81007f]/80">Verified</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-neutral-900">
                  {profile.isEmailVerified ? (
                    <>
                      <ShieldCheckIcon className="h-5 w-5 shrink-0 text-emerald-600" />
                      <span className="text-emerald-800">Email verified</span>
                    </>
                  ) : (
                    <Link
                      href={`/auth/verify-email?email=${encodeURIComponent(profile.email)}`}
                      className="font-medium text-[#81007f] hover:underline"
                    >
                      Verify email
                    </Link>
                  )}
                </dd>
              </div>
              <div className="rounded-lg bg-purple-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#81007f]/80">Status</dt>
                <dd className="mt-1">
                  <span className={statusClass(profile.status)}>{statusLabel(profile.status)}</span>
                </dd>
              </div>
              <div className="rounded-lg bg-purple-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#81007f]/80">Member since</dt>
                <dd className="mt-1 text-sm font-medium text-neutral-900">{formatDate(profile.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      <section className={cardClass}>
        <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Personal details</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Update your name and phone. Your email is used to sign in and cannot be changed here.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelClass}>
                First name
              </label>
              <input
                id="firstName"
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                disabled={saving || !profile}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                disabled={saving || !profile}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+2348012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              disabled={saving || !profile}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={profile?.email ?? ""}
              readOnly
              disabled
              className={`${inputClass} cursor-not-allowed bg-neutral-50 text-neutral-600`}
            />
            <p className="mt-1 text-xs text-neutral-500">Contact support to change your email address.</p>
          </div>

          <button
            type="submit"
            disabled={saving || !profile}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#81007f] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-[#6a0068] focus:outline-none focus:ring-2 focus:ring-[#81007f]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      <div className="rounded-xl border border-purple-100 bg-white px-4 py-3.5 text-center text-sm text-neutral-600 shadow-sm">
        <p>
          Need a new password?{" "}
          <Link
            href="/auth/forgot-password"
            className="font-semibold text-[#81007f] underline-offset-2 hover:underline"
          >
            Reset password
          </Link>
        </p>
      </div>
    </div>
  );
}
