"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatAdminDate, shortShipmentId } from "@/lib/admin-api";
import {
  getAdminComplaintById,
  updateAdminComplaintStatus,
  getReporterDisplayName,
  complaintStatusClass,
  reporterTypeClass,
  type AdminComplaintData,
} from "@/lib/complaints-api";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-base text-neutral-900">{value}</dd>
    </div>
  );
}

type ComplaintStatus = "open" | "in_review" | "resolved";

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [complaint, setComplaint] = useState<AdminComplaintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getAdminComplaintById(id);
      if (cancelled) return;
      setLoading(false);
      if (res.success && res.data) setComplaint(res.data);
      else setError(res.message || "Complaint not found");
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSetStatus(status: ComplaintStatus) {
    if (!complaint) return;
    setActionLoading(true);
    setError("");
    const res = await updateAdminComplaintStatus(complaint.id, status);
    setActionLoading(false);
    if (res.success && res.data) setComplaint(res.data);
    else setError(res.message || "Failed to update status");
  }

  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (error && !complaint) {
    return (
      <div>
        <Link href="/admin/complaints" className="text-sm font-medium text-[#81007f] hover:underline">
          ← Back to complaints
        </Link>
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!complaint) return null;

  const reporterProfileHref =
    complaint.reporterType === "rider"
      ? `/admin/riders/${complaint.reporter.id}`
      : `/admin/clients/${complaint.reporter.id}`;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link href="/admin/complaints" className="text-sm font-medium text-[#81007f] hover:underline">
          ← Back to complaints
        </Link>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">{complaint.subject}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className={reporterTypeClass(complaint.reporterType)}>{complaint.reporterType}</span>
          <span className={complaintStatusClass(complaint.status)}>{complaint.status.replace(/_/g, " ")}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#81007f] uppercase tracking-wide">Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailRow
            label="Reporter"
            value={
              <Link href={reporterProfileHref} className="text-[#81007f] hover:underline">
                {getReporterDisplayName(complaint.reporter)}
              </Link>
            }
          />
          <DetailRow label="Email" value={complaint.reporter.email} />
          <DetailRow label="Contact phone" value={complaint.phone || "—"} />
          <DetailRow label="Account phone" value={complaint.reporter.phone || "—"} />
          <DetailRow label="Submitted" value={formatAdminDate(complaint.createdAt)} />
          <DetailRow label="Last updated" value={formatAdminDate(complaint.updatedAt)} />
          <DetailRow
            label="Related shipment"
            value={
              complaint.relatedShipmentId ? (
                <Link
                  href={`/admin/shipments/${complaint.relatedShipmentId}`}
                  className="font-mono text-[#81007f] hover:underline"
                >
                  #{shortShipmentId(complaint.relatedShipmentId)}
                </Link>
              ) : (
                "—"
              )
            }
          />
        </dl>
        <div>
          <h3 className="text-sm font-medium text-neutral-500">Message</h3>
          <p className="mt-1 text-base text-neutral-900 whitespace-pre-wrap">{complaint.message}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#81007f] uppercase tracking-wide">Update status</h2>
        <div className="flex flex-wrap gap-2">
          {(["open", "in_review", "resolved"] as const).map((s) => (
            <button
              key={s}
              type="button"
              disabled={actionLoading || complaint.status === s}
              onClick={() => handleSetStatus(s)}
              className="min-h-[44px] px-4 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#81007f]"
            >
              Mark {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
