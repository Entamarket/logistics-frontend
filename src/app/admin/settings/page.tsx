"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyProfile, updateMyProfile, type UserProfile } from "@/lib/auth-api";
import { ChangeEmailSection } from "@/components/ChangeEmailSection";
import { ChangePasswordSection } from "@/components/ChangePasswordSection";
import { DeleteAccountSection } from "@/components/DeleteAccountSection";

const inputClass =
  "mt-1.5 block w-full min-h-[44px] rounded-xl border border-purple-200/70 bg-white px-4 py-2.5 text-base text-neutral-900 shadow-sm placeholder:text-neutral-500 transition focus:border-[#81007f] focus:outline-none focus:ring-2 focus:ring-[#81007f]/30";
const labelClass = "block text-sm font-semibold text-neutral-800";
const cardClass =
  "overflow-hidden rounded-2xl border border-purple-100/90 bg-white shadow-lg shadow-purple-500/10";

export default function AdminSettingsPage() {
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
    setLoading(true);
    setError("");
    const res = await getMyProfile();
    setLoading(false);
    if (res.success && res.data) {
      setProfile(res.data);
      setFirstName(res.data.firstName);
      setLastName(res.data.lastName);
      setPhone(res.data.phone);
      return;
    }
    if (res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(res.message || "Failed to load profile");
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    const res = await updateMyProfile({ firstName, lastName, phone });
    setSaving(false);
    if (res.success && res.data) {
      setProfile(res.data);
      setSuccess("Your profile has been updated.");
      return;
    }
    setError(res.message || "Failed to update profile");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Settings</h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-500">
          Manage your admin account details and sign-in email.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading profile…</p>
      ) : (
        <>
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

          <section className={cardClass}>
            <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Personal details</h2>
                <p className="mt-1 text-sm text-neutral-500">Update your name and phone number.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="admin-firstName" className={labelClass}>
                    First name
                  </label>
                  <input
                    id="admin-firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    disabled={saving || !profile}
                  />
                </div>
                <div>
                  <label htmlFor="admin-lastName" className={labelClass}>
                    Last name
                  </label>
                  <input
                    id="admin-lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    disabled={saving || !profile}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="admin-phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="admin-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  disabled={saving || !profile}
                />
              </div>
              <button
                type="submit"
                disabled={saving || !profile}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#81007f] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-[#6a0068] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </section>

          {profile && (
            <ChangeEmailSection
              currentEmail={profile.email}
              onEmailChanged={(updated) => {
                setProfile(updated);
                setSuccess("Your email has been updated.");
              }}
            />
          )}

          <ChangePasswordSection />

          <DeleteAccountSection />
        </>
      )}
    </div>
  );
}
