"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createComplaint,
  getMyComplaints,
  complaintStatusClass,
  type ComplaintData,
} from "@/lib/complaints-api";
import { formatAdminDate, shortShipmentId } from "@/lib/admin-api";

const inputClass =
  "mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]";

interface ComplaintsPanelProps {
  shipmentLinkPrefix: string;
}

export function ComplaintsPanel({ shipmentLinkPrefix }: ComplaintsPanelProps) {
  const router = useRouter();
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [relatedShipmentId, setRelatedShipmentId] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    const res = await getMyComplaints();
    setLoading(false);
    if (res.success && res.data) {
      setComplaints(res.data);
      return;
    }
    const msg = res.message || "Failed to load complaints";
    if (msg.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(msg);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    const res = await createComplaint({
      subject: subject.trim(),
      message: message.trim(),
      phone: phone.trim(),
      ...(relatedShipmentId.trim() ? { relatedShipmentId: relatedShipmentId.trim() } : {}),
    });
    setSubmitting(false);
    if (res.success) {
      setSuccess("Your complaint has been submitted. Our team will review it shortly.");
      setSubject("");
      setMessage("");
      setPhone("");
      setRelatedShipmentId("");
      setLoading(true);
      await load();
      return;
    }
    setError(res.message || "Failed to submit complaint");
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Complaints</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Report an issue with a delivery or your experience. We typically respond within 1–2 business days.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900">Submit a complaint</h2>

        <label className="block">
          <span className="text-sm font-medium text-neutral-900">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={200}
            placeholder="Brief summary of the issue"
            className={`${inputClass} min-h-[44px]`}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-900">Phone number</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            maxLength={30}
            placeholder="+1234567890"
            className={`${inputClass} min-h-[44px]`}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-900">Details</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            placeholder="Describe what happened and any relevant details (minimum 10 characters)."
            className={`${inputClass} py-2`}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-900">
            Related shipment ID <span className="text-neutral-600 font-normal">(optional)</span>
          </span>
          <input
            type="text"
            value={relatedShipmentId}
            onChange={(e) => setRelatedShipmentId(e.target.value)}
            placeholder="Paste shipment id if applicable"
            className={`${inputClass} min-h-[44px] font-mono`}
          />
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
          disabled={submitting}
          className="inline-flex justify-center items-center min-h-[44px] w-full sm:w-auto px-6 rounded-lg bg-[#81007f] text-white font-medium hover:bg-[#6a0068] focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit complaint"}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-neutral-900">Your complaints</h2>
        {loading && <p className="text-sm text-neutral-500">Loading…</p>}
        {!loading && complaints.length === 0 && (
          <p className="text-sm text-neutral-500">You have not submitted any complaints yet.</p>
        )}
        {!loading && complaints.length > 0 && (
          <ul className="space-y-3">
            {complaints.map((c) => (
              <li key={c.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-neutral-900">{c.subject}</h3>
                  <span className={complaintStatusClass(c.status)}>{c.status.replace(/_/g, " ")}</span>
                </div>
                <p className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{c.message}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                  {c.phone && <span>Phone: {c.phone}</span>}
                  <span>Submitted {formatAdminDate(c.createdAt)}</span>
                  {c.relatedShipmentId && shipmentLinkPrefix && (
                    <Link
                      href={`${shipmentLinkPrefix}/${c.relatedShipmentId}`}
                      className="text-[#81007f] font-medium hover:underline"
                    >
                      Shipment #{shortShipmentId(c.relatedShipmentId)}
                    </Link>
                  )}
                  {c.relatedShipmentId && !shipmentLinkPrefix && (
                    <span className="font-mono">#{shortShipmentId(c.relatedShipmentId)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
