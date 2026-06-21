"use client";

import { FormEvent, useState } from "react";
import { getPublicShipmentStatus, type PublicShipmentStatus } from "@/lib/shipment-api";
import { formatShipmentStatus, landingShipmentStatusClass } from "@/lib/shipment-status";

function shortRef(id: string): string {
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

export function HeroShipmentTracker() {
  const [shipmentId, setShipmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PublicShipmentStatus | null>(null);

  async function handleTrack(e: FormEvent) {
    e.preventDefault();
    const id = shipmentId.trim();
    if (!id) {
      setError("Enter your shipment ID.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const res = await getPublicShipmentStatus(id);
    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
      return;
    }

    setError(res.message || "Shipment not found. Check the ID and try again.");
  }

  return (
    <div className="landing-animate-fade-up-delay-3 mx-auto mt-6 w-full max-w-xl lg:mx-0">
      <div className="rounded-2xl border border-purple-200/70 bg-white/90 p-4 shadow-[0_12px_40px_rgba(129,0,127,0.12)] ring-1 ring-white/80 backdrop-blur-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#81007f] to-fuchsia-500 text-white shadow-[0_4px_16px_rgba(129,0,127,0.35)]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm font-bold text-neutral-900">Track your shipment</p>
            <p className="text-xs text-neutral-500">Enter your shipment ID to see the current status</p>
          </div>
        </div>

        <form onSubmit={handleTrack} className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="hero-shipment-id">
            Shipment ID
          </label>
          <input
            id="hero-shipment-id"
            type="text"
            value={shipmentId}
            onChange={(e) => {
              setShipmentId(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. 664a1b2c3d4e5f6789012345"
            autoComplete="off"
            spellCheck={false}
            className="min-h-[48px] flex-1 rounded-xl border border-purple-200/80 bg-white px-4 text-sm text-neutral-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] placeholder:text-neutral-400 focus:border-[#81007f]/50 focus:outline-none focus:ring-2 focus:ring-[#81007f]/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#6a0068] to-[#81007f] px-6 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(129,0,127,0.35)] transition hover:shadow-[0_8px_28px_rgba(129,0,127,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking…" : "Track"}
          </button>
        </form>

        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {result ? (
          <div
            className="mt-4 rounded-xl border border-purple-100 bg-gradient-to-br from-fuchsia-50/80 to-white p-4"
            role="status"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Ref #{shortRef(result.shipmentId)}
              </p>
              <span className={landingShipmentStatusClass(result.status)}>
                {formatShipmentStatus(result.status)}
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              {result.deliveryType === "scheduled" ? "Scheduled delivery" : "Instant delivery"}
              {" · "}
              Last updated{" "}
              {new Date(result.updatedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
