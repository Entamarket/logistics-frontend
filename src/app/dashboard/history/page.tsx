"use client";

import { useState, useEffect } from "react";
import { getShipments, type ShipmentData } from "@/lib/shipment-api";
import { formatContactLocation } from "@/lib/location-data";
import { createFeedback, getMyFeedback, type FeedbackData } from "@/lib/feedback-api";

function statusClass(status: string): string {
  const base =
    "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full capitalize shadow-sm";
  switch (status) {
    case "delivered":
      return `${base} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/80 shadow-[0_0_12px_rgba(16,185,129,0.45)]`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
    case "searching_rider":
      return `${base} bg-sky-100 text-sky-800 ring-1 ring-sky-300/80 shadow-[0_0_12px_rgba(14,165,233,0.45)]`;
    case "awaiting_rider_response":
      return `${base} bg-violet-100 text-violet-800 ring-1 ring-violet-300/80 shadow-[0_0_12px_rgba(139,92,246,0.45)]`;
    case "scheduled":
    case "pending":
      return `${base} bg-amber-100 text-amber-800 ring-1 ring-amber-300/80 shadow-[0_0_12px_rgba(245,158,11,0.45)]`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800 ring-1 ring-red-300/80 shadow-[0_0_12px_rgba(239,68,68,0.45)]`;
    default:
      return `${base} bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200/80`;
  }
}

function neonCardClass(status: string): string {
  const base =
    "border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01]";
  switch (status) {
    case "delivered":
      return `${base} border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/20 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_8px_32px_rgba(16,185,129,0.18),0_0_48px_rgba(34,211,238,0.12)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_12px_40px_rgba(16,185,129,0.28),0_0_64px_rgba(34,211,238,0.2)]`;
    case "cancelled":
      return `${base} border-red-200/80 bg-gradient-to-br from-white via-red-50/30 to-rose-50/20 shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_8px_32px_rgba(239,68,68,0.15),0_0_48px_rgba(244,63,94,0.1)] hover:shadow-[0_0_0_1px_rgba(239,68,68,0.35),0_12px_40px_rgba(239,68,68,0.22),0_0_64px_rgba(244,63,94,0.15)]`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
    case "searching_rider":
      return `${base} border-sky-200/80 bg-gradient-to-br from-white via-sky-50/30 to-blue-50/20 shadow-[0_0_0_1px_rgba(14,165,233,0.2),0_8px_32px_rgba(14,165,233,0.18),0_0_48px_rgba(59,130,246,0.12)] hover:shadow-[0_0_0_1px_rgba(14,165,233,0.35),0_12px_40px_rgba(14,165,233,0.28),0_0_64px_rgba(59,130,246,0.2)]`;
    case "awaiting_rider_response":
      return `${base} border-violet-200/80 bg-gradient-to-br from-white via-violet-50/30 to-fuchsia-50/20 shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_8px_32px_rgba(139,92,246,0.18),0_0_48px_rgba(217,70,239,0.12)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_12px_40px_rgba(139,92,246,0.28),0_0_64px_rgba(217,70,239,0.2)]`;
    case "scheduled":
    case "pending":
      return `${base} border-amber-200/80 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_8px_32px_rgba(245,158,11,0.16),0_0_48px_rgba(251,146,60,0.1)] hover:shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_12px_40px_rgba(245,158,11,0.24),0_0_64px_rgba(251,146,60,0.15)]`;
    default:
      return `${base} border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-fuchsia-50/10 shadow-[0_0_0_1px_rgba(129,0,127,0.2),0_8px_32px_rgba(129,0,127,0.15),0_0_48px_rgba(168,85,247,0.1)] hover:shadow-[0_0_0_1px_rgba(129,0,127,0.35),0_12px_40px_rgba(129,0,127,0.22),0_0_64px_rgba(168,85,247,0.18)]`;
  }
}

function neonAccentBar(status: string): string {
  switch (status) {
    case "delivered":
      return "bg-gradient-to-r from-transparent via-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]";
    case "cancelled":
      return "bg-gradient-to-r from-transparent via-red-400 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]";
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
    case "searching_rider":
      return "bg-gradient-to-r from-transparent via-sky-400 to-blue-400 shadow-[0_0_12px_rgba(14,165,233,0.8)]";
    case "awaiting_rider_response":
      return "bg-gradient-to-r from-transparent via-violet-400 to-fuchsia-400 shadow-[0_0_12px_rgba(139,92,246,0.8)]";
    case "scheduled":
    case "pending":
      return "bg-gradient-to-r from-transparent via-amber-400 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]";
    default:
      return "bg-gradient-to-r from-transparent via-[#81007f] to-fuchsia-400 shadow-[0_0_12px_rgba(129,0,127,0.8)]";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function recipientInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function ShipmentHistoryPage() {
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [feedbackByShipmentId, setFeedbackByShipmentId] = useState<Record<string, FeedbackData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formShipmentId, setFormShipmentId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    Promise.all([getShipments(), getMyFeedback()]).then(([shipmentsRes, feedbackRes]) => {
      setLoading(false);

      if (shipmentsRes.success && shipmentsRes.data) {
        setShipments(shipmentsRes.data);
      } else {
        setError(shipmentsRes.message || "Failed to load shipments");
      }

      if (feedbackRes.success && feedbackRes.data) {
        const mapped: Record<string, FeedbackData> = {};
        for (const item of feedbackRes.data) {
          mapped[item.shipmentId] = item;
        }
        setFeedbackByShipmentId(mapped);
      }
    });
  }, []);

  async function submitFeedback(shipmentId: string) {
    setSubmitError("");
    if (rating < 1 || rating > 5) {
      setSubmitError("Please tap a star to choose your rating.");
      return;
    }
    setSubmitting(true);
    const res = await createFeedback({
      shipmentId,
      rating,
      comment,
    });
    setSubmitting(false);

    if (!res.success || !res.data) {
      setSubmitError(res.message || "Could not submit feedback");
      return;
    }

    setFeedbackByShipmentId((prev) => ({
      ...prev,
      [shipmentId]: res.data!,
    }));
    setFormShipmentId(null);
    setRating(0);
    setComment("");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-br from-[#81007f]/10 via-white to-fuchsia-50/50 px-5 py-5 shadow-[0_0_0_1px_rgba(129,0,127,0.15),0_8px_32px_rgba(129,0,127,0.12),0_0_56px_rgba(168,85,247,0.15)]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden />
        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#81007f] text-white shadow-[0_4px_20px_rgba(129,0,127,0.4),0_0_28px_rgba(168,85,247,0.35)]">
            <HistoryIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#81007f] drop-shadow-[0_0_12px_rgba(129,0,127,0.25)]">
              Shipment history
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              All your deliveries — rate riders after a completed drop-off.
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading shipments">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-purple-200/60 bg-gradient-to-r from-purple-100/70 via-fuchsia-50/50 to-purple-100/70 shadow-[0_0_24px_rgba(168,85,247,0.12),0_8px_32px_rgba(129,0,127,0.08)]"
            />
          ))}
        </div>
      )}

      {error && (
        <div
          className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_4px_20px_rgba(239,68,68,0.12)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && shipments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/50 px-6 py-12 text-center shadow-[inset_0_0_32px_rgba(168,85,247,0.08),0_0_48px_rgba(129,0,127,0.1)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(129,0,127,0.2),0_0_32px_rgba(168,85,247,0.25)]">
            <HistoryIcon className="h-7 w-7 text-[#81007f]/70" />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-800">No shipments yet</p>
          <p className="mt-1 text-sm text-neutral-500">
            When you create a delivery, it will appear here with status and details.
          </p>
        </div>
      )}

      {!loading && !error && shipments.length > 0 && (
        <ul className="space-y-5">
          {shipments.map((s) => (
            <li
              key={s._id}
              className={`relative overflow-hidden rounded-2xl ${neonCardClass(s.status)}`}
            >
              <div className={`h-0.5 w-full ${neonAccentBar(s.status)}`} aria-hidden />
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#81007f] to-purple-600 text-base font-bold text-white shadow-[0_4px_16px_rgba(129,0,127,0.35)]">
                      {recipientInitial(s.recipientDetails.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-neutral-900 truncate">
                        {s.recipientDetails.fullName}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">{formatDate(s.createdAt)}</p>
                    </div>
                  </div>
                  <span className={statusClass(s.status)}>{s.status.replace(/_/g, " ")}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-purple-50/90 px-3 py-1 text-xs font-medium text-[#81007f] ring-1 ring-purple-200/80 shadow-[0_0_12px_rgba(129,0,127,0.12)]">
                    {s.deliveryType === "scheduled" ? "Scheduled" : "Instant"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                    ₦{s.price.toLocaleString()}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-orange-50/30 p-3 shadow-[0_0_16px_rgba(245,158,11,0.1)]">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Pickup</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
                      {formatContactLocation(s.senderDetails)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-blue-50/30 p-3 shadow-[0_0_16px_rgba(14,165,233,0.1)]">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Drop-off</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
                      {formatContactLocation(s.recipientDetails)}
                    </p>
                  </div>
                </div>

                {s.status === "delivered" && s.riderID && (
                  <div className="border-t border-purple-100/80 pt-4">
                    {feedbackByShipmentId[s._id] ? (
                      <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/95 to-cyan-50/40 px-3.5 py-3 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_4px_24px_rgba(16,185,129,0.22),0_0_40px_rgba(34,211,238,0.15)]">
                        <p className="text-sm font-medium text-emerald-900 flex flex-wrap items-center gap-2">
                          <span>Feedback submitted</span>
                          <span className="flex gap-0.5" aria-hidden>
                            {Array.from({ length: feedbackByShipmentId[s._id].rating }, (_, i) => (
                              <span
                                key={i}
                                className="text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.75)]"
                              >
                                ★
                              </span>
                            ))}
                          </span>
                        </p>
                        {feedbackByShipmentId[s._id].riderName && (
                          <p className="mt-1 text-xs text-emerald-800/90">
                            Rider: {feedbackByShipmentId[s._id].riderName}
                          </p>
                        )}
                        {feedbackByShipmentId[s._id].comment && (
                          <p className="mt-2 text-sm text-emerald-800/95">{feedbackByShipmentId[s._id].comment}</p>
                        )}
                      </div>
                    ) : (
                      <>
                        {formShipmentId !== s._id ? (
                          <button
                            type="button"
                            onClick={() => {
                              setFormShipmentId(s._id);
                              setRating(0);
                              setComment("");
                              setSubmitError("");
                            }}
                            className="rounded-lg bg-[#81007f] px-3 py-2 text-sm font-medium text-white shadow-[0_4px_20px_rgba(129,0,127,0.45),0_0_28px_rgba(168,85,247,0.35)] transition hover:bg-[#6a0068] hover:shadow-[0_6px_28px_rgba(129,0,127,0.55),0_0_36px_rgba(168,85,247,0.45)]"
                          >
                            Rate rider
                          </button>
                        ) : (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              submitFeedback(s._id);
                            }}
                            className="space-y-3 rounded-xl border border-purple-100/80 bg-purple-50/30 p-4 shadow-[inset_0_0_24px_rgba(168,85,247,0.06)]"
                          >
                            <div>
                              <span id={`rating-label-${s._id}`} className="block text-sm font-medium text-neutral-800">
                                Rating
                              </span>
                              <p className="mt-0.5 text-xs text-neutral-500">Tap a star to rate your rider.</p>
                              <div
                                className="mt-2 flex items-center gap-0.5"
                                role="group"
                                aria-labelledby={`rating-label-${s._id}`}
                              >
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`rounded p-0.5 text-3xl leading-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#81007f]/50 focus-visible:ring-offset-1 ${
                                      star <= rating
                                        ? "text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.85)]"
                                        : "text-neutral-300"
                                    }`}
                                    aria-label={`${star} out of 5 stars`}
                                    aria-pressed={star <= rating}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label htmlFor={`comment-${s._id}`} className="block text-sm font-medium text-neutral-800">
                                Comment (optional)
                              </label>
                              <textarea
                                id={`comment-${s._id}`}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                maxLength={1000}
                                placeholder="Share your delivery experience with this rider"
                                className="mt-1 w-full rounded-lg border border-purple-200/80 bg-white/90 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-[#81007f] focus:outline-none focus:ring-2 focus:ring-[#81007f]/40"
                              />
                            </div>

                            {submitError && (
                              <p className="text-sm text-red-700" role="alert">
                                {submitError}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="submit"
                                disabled={submitting || rating < 1}
                                className="rounded-lg bg-[#81007f] px-3 py-2 text-sm font-medium text-white shadow-[0_4px_20px_rgba(129,0,127,0.45),0_0_28px_rgba(168,85,247,0.35)] hover:bg-[#6a0068] disabled:opacity-50"
                              >
                                {submitting ? "Submitting..." : "Submit feedback"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormShipmentId(null);
                                  setRating(0);
                                  setComment("");
                                  setSubmitError("");
                                }}
                                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
