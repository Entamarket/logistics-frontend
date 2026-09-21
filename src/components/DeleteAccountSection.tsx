"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMyAccount } from "@/lib/auth-api";

const defaultInputClass =
  "mt-1.5 block w-full min-h-[44px] rounded-xl border border-red-200/80 bg-white px-4 py-2.5 text-base text-neutral-900 shadow-sm placeholder:text-neutral-500 transition focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/30";
const defaultLabelClass = "block text-sm font-semibold text-neutral-800";
const defaultCardClass =
  "overflow-hidden rounded-2xl border border-red-200/80 bg-white shadow-lg shadow-red-500/10";
const defaultBtnClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-red-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600/40 disabled:cursor-not-allowed disabled:opacity-60";
const defaultBtnSecondaryClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60";

export interface DeleteAccountSectionProps {
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  cardClassName?: string;
  buttonClassName?: string;
  secondaryButtonClassName?: string;
}

export function DeleteAccountSection({
  className,
  inputClassName = defaultInputClass,
  labelClassName = defaultLabelClass,
  cardClassName = defaultCardClass,
  buttonClassName = defaultBtnClass,
  secondaryButtonClassName = defaultBtnSecondaryClass,
}: DeleteAccountSectionProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setError('Type DELETE to confirm.');
      return;
    }
    if (!password) {
      setError("Enter your current password.");
      return;
    }

    setLoading(true);
    const res = await deleteMyAccount({ password });
    setLoading(false);

    if (res.success) {
      router.replace("/auth/login");
      router.refresh();
      return;
    }
    setError(res.message || "Could not delete account.");
  }

  return (
    <section className={className ?? cardClassName}>
      <div className="h-1 bg-gradient-to-r from-red-700 via-red-500 to-orange-400" aria-hidden />
      <div className="space-y-4 p-5">
        <div>
          <h2 className="text-base font-semibold text-red-800">Delete account</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Permanently delete your account and personal data. This cannot be undone. Active
            shipments must be completed or cancelled first.
          </p>
        </div>

        {!expanded ? (
          <button type="button" onClick={() => setExpanded(true)} className={buttonClassName}>
            Delete my account
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Your profile, login credentials, and personal details will be removed. Shipment history
              may be kept in anonymized form for business and payment records.
            </div>

            <div>
              <label htmlFor="delete-account-password" className={labelClassName}>
                Current password
              </label>
              <input
                id="delete-account-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="delete-account-confirm" className={labelClassName}>
                Type <span className="font-bold tracking-wide">DELETE</span> to confirm
              </label>
              <input
                id="delete-account-confirm"
                type="text"
                required
                autoComplete="off"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={inputClassName}
                disabled={loading}
                placeholder="DELETE"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="submit"
                disabled={loading || confirmText.trim().toUpperCase() !== "DELETE"}
                className={buttonClassName}
              >
                {loading ? "Deleting…" : "Permanently delete account"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setExpanded(false);
                  setPassword("");
                  setConfirmText("");
                  setError("");
                }}
                className={secondaryButtonClassName}
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
