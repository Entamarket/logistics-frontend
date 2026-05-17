"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyProfile, updateMyProfile, type UserProfile } from "@/lib/auth-api";

const inputClass =
  "mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]";
const labelClass = "block text-sm font-medium text-neutral-900";

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
  const base = "inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize";
  if (status === "active") return `${base} bg-green-100 text-green-800`;
  if (status === "suspended") return `${base} bg-amber-100 text-amber-800`;
  return `${base} bg-red-100 text-red-800`;
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
      <div className="max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Profile setting</h1>
        <p className="mt-4 text-sm text-neutral-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Profile setting</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Update your name and contact phone. Your email is used to sign in and cannot be changed here.
        </p>
      </div>

      {profile && (
        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Account overview</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-neutral-500">Email</dt>
              <dd className="mt-0.5 font-medium text-neutral-900 break-all">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Email verified</dt>
              <dd className="mt-0.5">
                {profile.isEmailVerified ? (
                  <span className="text-green-700 font-medium">Verified</span>
                ) : (
                  <Link href={`/auth/verify-email?email=${encodeURIComponent(profile.email)}`} className="text-[#81007f] font-medium hover:underline">
                    Verify email
                  </Link>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Account status</dt>
              <dd className="mt-0.5">
                <span className={statusClass(profile.status)}>{statusLabel(profile.status)}</span>
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Member since</dt>
              <dd className="mt-0.5 text-neutral-900">{formatDate(profile.createdAt)}</dd>
            </div>
          </dl>
        </section>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm space-y-4"
      >
        <h2 className="text-base font-semibold text-neutral-900">Personal details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className={labelClass}>First name</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Last name</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
              className={inputClass}
            />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Phone number</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
            placeholder="+2348012345678"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            value={profile?.email ?? ""}
            readOnly
            disabled
            className={`${inputClass} bg-neutral-50 text-neutral-600 cursor-not-allowed`}
          />
          <p className="mt-1 text-xs text-neutral-500">Contact support to change your email address.</p>
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800" role="status">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex justify-center items-center min-h-[44px] px-6 rounded-lg bg-[#81007f] text-white font-medium hover:bg-[#6a0068] focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <p className="text-sm text-neutral-600">
        Need to change your password?{" "}
        <Link href="/auth/forgot-password" className="font-medium text-[#81007f] hover:underline">
          Reset password
        </Link>
      </p>
    </div>
  );
}
