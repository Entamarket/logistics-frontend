"use client";

import { useState, useEffect } from "react";
import { getShipments, type ShipmentData } from "@/lib/shipment-api";
import { createFeedback, getMyFeedback, type FeedbackData } from "@/lib/feedback-api";

function statusClass(status: string): string {
  const base = "inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize";
  switch (status) {
    case "delivered":
      return `${base} bg-green-100 text-green-800`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
    case "searching_rider":
      return `${base} bg-blue-100 text-blue-800`;
    case "awaiting_rider_response":
      return `${base} bg-purple-100 text-purple-800`;
    case "scheduled":
    case "pending":
      return `${base} bg-amber-100 text-amber-800`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800`;
    default:
      return `${base} bg-neutral-100 text-neutral-800`;
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
    <div className="max-w-4xl">
      <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Shipment history</h1>
      <p className="mt-1 text-sm text-neutral-500">All your shipments, most recent first.</p>

      {loading && <p className="mt-4 text-sm text-neutral-500">Loading...</p>}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && shipments.length === 0 && (
        <p className="mt-4 text-sm text-neutral-500">No shipments yet. Create one to get started.</p>
      )}

      {!loading && !error && shipments.length > 0 && (
        <ul className="mt-4 space-y-3">
          {shipments.map((s) => (
            <li
              key={s._id}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:border-neutral-300 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    To: {s.recipientDetails.fullName}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Created {formatDate(s.createdAt)}
                  </p>
                  <p className="text-sm text-neutral-600 mt-1">
                    {s.deliveryType === "scheduled" ? "Scheduled" : "Instant"} · ₦{s.price.toLocaleString()}
                  </p>
                </div>
                <span className={statusClass(s.status)}>
                  {s.status.replace(/_/g, " ")}
                </span>
              </div>

              {s.status === "delivered" && s.riderID && (
                <div className="mt-4 border-t border-neutral-100 pt-3">
                  {feedbackByShipmentId[s._id] ? (
                    <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                      <p className="text-sm font-medium text-green-800 flex flex-wrap items-center gap-2">
                        <span>Feedback submitted:</span>
                        <span className="flex gap-0.5 text-amber-500" aria-hidden>
                          {Array.from({ length: feedbackByShipmentId[s._id].rating }, (_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </span>
                      </p>
                      {feedbackByShipmentId[s._id].comment && (
                        <p className="mt-1 text-sm text-green-700">{feedbackByShipmentId[s._id].comment}</p>
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
                            setSubmitError("");
                          }}
                          className="rounded-lg bg-[#81007f] px-3 py-2 text-sm font-medium text-white hover:bg-[#6a0068]"
                        >
                          Rate rider
                        </button>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            submitFeedback(s._id);
                          }}
                          className="space-y-3"
                        >
                          <div>
                            <span id={`rating-label-${s._id}`} className="block text-sm font-medium text-neutral-700">
                              Rating
                            </span>
                            <p className="mt-0.5 text-xs text-neutral-500">Tap a star. Stars start grey until you choose.</p>
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
                                  className={`rounded p-0.5 text-3xl leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#81007f] focus-visible:ring-offset-1 ${
                                    star <= rating ? "text-amber-500" : "text-neutral-300"
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
                            <label htmlFor={`comment-${s._id}`} className="block text-sm font-medium text-neutral-700">
                              Comment (optional)
                            </label>
                            <textarea
                              id={`comment-${s._id}`}
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              rows={3}
                              maxLength={1000}
                              placeholder="Share your delivery experience with this rider"
                              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]"
                            />
                          </div>

                          {submitError && (
                            <p className="text-sm text-red-700" role="alert">
                              {submitError}
                            </p>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              type="submit"
                              disabled={submitting || rating < 1}
                              className="rounded-lg bg-[#81007f] px-3 py-2 text-sm font-medium text-white hover:bg-[#6a0068] disabled:opacity-50"
                            >
                              {submitting ? "Submitting..." : "Submit feedback"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormShipmentId(null);
                                setRating(0);
                              }}
                              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
