"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createComplaint, getMyComplaints, type ComplaintData } from "@/lib/complaints-api";
import { formatAdminDate, shortShipmentId } from "@/lib/admin-api";
import {
  ClientEmptyState,
  ClientErrorAlert,
  ClientLoadingBlock,
  ClientPageHeader,
  ClientSection,
  ClientShell,
  ClientSuccessAlert,
  clientBtnPrimary,
  clientCard,
  clientComplaintStatus,
  clientInputClass,
  clientLabelClass,
} from "@/components/client/ClientUI";
import {
  RiderEmptyState,
  RiderErrorAlert,
  RiderLoadingBlock,
  RiderPageHeader,
  RiderShell,
  RiderSuccessAlert,
  riderBtnPrimary,
  riderCard,
  riderCardAccentAmber,
  riderInputClass,
  riderLabelClass,
} from "@/components/rider/RiderUI";

function riderComplaintStatus(status: string): string {
  const base = "inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize";
  switch (status) {
    case "open":
      return `${base} bg-amber-100 text-amber-900 ring-1 ring-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]`;
    case "in_review":
      return `${base} bg-purple-100 text-[#6a0068] ring-1 ring-purple-200 shadow-[0_0_14px_rgba(129,0,127,0.28)]`;
    case "resolved":
      return `${base} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]`;
    default:
      return `${base} bg-slate-100 text-slate-700 ring-1 ring-slate-200`;
  }
}

function ComplaintIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
  );
}

interface ComplaintsPanelProps {
  shipmentLinkPrefix: string;
  variant?: "client" | "rider";
}

export function ComplaintsPanel({ shipmentLinkPrefix, variant = "client" }: ComplaintsPanelProps) {
  const isRider = variant === "rider";
  const isClient = !isRider;
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

  const inputClass = isRider ? riderInputClass : clientInputClass;
  const labelClass = isRider ? riderLabelClass : clientLabelClass;

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

  const formFields = (
    <>

        <label className="block">
          <span className={labelClass}>Subject</span>
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
          <span className={labelClass}>Phone number</span>
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
          <span className={labelClass}>Details</span>
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
          <span className={labelClass}>
            Related shipment ID <span className="font-normal text-slate-500">(optional)</span>
          </span>
          <input
            type="text"
            value={relatedShipmentId}
            onChange={(e) => setRelatedShipmentId(e.target.value)}
            placeholder="Paste shipment id if applicable"
            className={`${inputClass} min-h-[44px] font-mono`}
          />
        </label>

      {error &&
        (isRider ? <RiderErrorAlert>{error}</RiderErrorAlert> : <ClientErrorAlert>{error}</ClientErrorAlert>)}
      {success &&
        (isRider ? (
          <RiderSuccessAlert>{success}</RiderSuccessAlert>
        ) : (
          <ClientSuccessAlert>{success}</ClientSuccessAlert>
        ))}

      <button
        type="submit"
        disabled={submitting}
        className={`${isRider ? riderBtnPrimary : clientBtnPrimary} w-full sm:w-auto`}
      >
        {submitting ? "Submitting…" : "Submit complaint"}
      </button>
    </>
  );

  const formSection = isClient ? (
    <form onSubmit={handleSubmit}>
      <ClientSection
        title="Submit a complaint"
        description="Tell us what went wrong. Include a shipment ID if the issue relates to a specific delivery."
        accent="amber"
      >
        <div className="space-y-4">{formFields}</div>
      </ClientSection>
    </form>
  ) : (
    <form onSubmit={handleSubmit} className={`${riderCard} space-y-4 p-5`}>
      <div className={riderCardAccentAmber} aria-hidden />
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-amber-900">Submit a complaint</h2>
        {formFields}
      </div>
    </form>
  );

  const listSection = (
    <section className="space-y-3">
      <h2 className={isRider ? "text-lg font-bold text-[#6a0068]" : "text-lg font-bold text-[#81007f]"}>
        Your complaints
      </h2>
      {loading &&
        (isRider ? (
          <RiderLoadingBlock label="Loading complaints…" />
        ) : (
          <ClientLoadingBlock label="Loading complaints…" />
        ))}
      {!loading &&
        complaints.length === 0 &&
        (isRider ? (
          <RiderEmptyState
            icon={<ComplaintIcon className="h-7 w-7" />}
            title="No complaints yet"
            description="Use the form above if you need to report an issue with a delivery."
          />
        ) : (
          <ClientEmptyState
            icon={<ComplaintIcon className="h-7 w-7" />}
            title="No complaints yet"
            description="Use the form above if you need to report an issue with a delivery."
          />
        ))}
      {!loading && complaints.length > 0 && (
        <ul className="space-y-3">
          {complaints.map((c) => (
            <li key={c.id} className={isRider ? `${riderCard} p-5` : `${clientCard} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className={`text-sm font-semibold ${isRider ? "text-slate-900" : "text-neutral-900"}`}>
                  {c.subject}
                </h3>
                <span className={isRider ? riderComplaintStatus(c.status) : clientComplaintStatus(c.status)}>
                  {c.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className={`mt-2 text-sm whitespace-pre-wrap ${isRider ? "text-slate-700" : "text-neutral-700"}`}>
                {c.message}
              </p>
              <div className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs ${isRider ? "text-slate-500" : "text-neutral-500"}`}>
                {c.phone && <span>Phone: {c.phone}</span>}
                <span>Submitted {formatAdminDate(c.createdAt)}</span>
                {c.relatedShipmentId && shipmentLinkPrefix && (
                  <Link
                    href={`${shipmentLinkPrefix}/${c.relatedShipmentId}`}
                    className="font-semibold text-[#81007f] hover:underline"
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
  );

  const inner = (
    <div className="max-w-2xl space-y-8">
      {isRider ? (
        <RiderPageHeader
          badge="Support"
          title="Complaints"
          description="Report an issue with a delivery or your experience. We typically respond within 1–2 business days."
          icon={<ComplaintIcon className="h-6 w-6" />}
        />
      ) : (
        <ClientPageHeader
          title="Complaints"
          description="Report an issue with a delivery or your experience. We typically respond within 1–2 business days."
          icon={<ComplaintIcon className="h-6 w-6" />}
        />
      )}
      {formSection}
      {listSection}
    </div>
  );

  if (isRider) {
    return <RiderShell>{inner}</RiderShell>;
  }

  return <ClientShell>{inner}</ClientShell>;
}
