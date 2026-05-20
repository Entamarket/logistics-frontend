"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatAdminDate, shortShipmentId } from "@/lib/admin-api";
import {
  getAdminComplaintById,
  updateAdminComplaintStatus,
  getReporterDisplayName,
  complaintStatusNeonClass,
  reporterTypeNeonClass,
  type AdminComplaintData,
} from "@/lib/complaints-api";

const backLinkClass =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 shadow-[0_0_18px_rgba(232,121,249,0.12)] transition hover:border-fuchsia-400/35 hover:bg-fuchsia-500/10 hover:shadow-[0_0_24px_rgba(232,121,249,0.25)]";

const glassCard = "rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6";

function NeonShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-fuchsia-500/25 bg-gradient-to-br from-slate-950 via-[#1a0a24] to-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_80px_-20px_rgba(192,38,211,0.55),0_32px_64px_-24px_rgba(0,0,0,0.65)]">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-fuchsia-600/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-violet-600/20 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(129,0,127,0.12)_0%,transparent_55%)]"
        aria-hidden
      />
      <div className="relative p-6 sm:p-8">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-white/95 sm:text-base">{value}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/75">{children}</h2>
  );
}

type ComplaintStatus = "open" | "in_review" | "resolved";

const statusButtonActive: Record<ComplaintStatus, string> = {
  open: "border-amber-400/50 bg-amber-500/25 text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.3)] ring-1 ring-amber-300/30",
  in_review:
    "border-sky-400/50 bg-sky-500/25 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.28)] ring-1 ring-sky-300/30",
  resolved:
    "border-emerald-400/50 bg-emerald-500/25 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.3)] ring-1 ring-emerald-300/30",
};

const statusButtonIdle =
  "border-white/15 bg-white/5 text-white/75 hover:border-white/25 hover:bg-white/10 hover:text-white";

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
    if (res.success && res.data) {
      setComplaint(res.data);
      setError("");
    } else setError(res.message || "Failed to update status");
  }

  if (loading) {
    return (
      <NeonShell>
        <div
          className="flex max-w-3xl items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          role="status"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
          Loading complaint…
        </div>
      </NeonShell>
    );
  }

  if (error && !complaint) {
    return (
      <NeonShell>
        <div className="max-w-3xl space-y-6">
          <Link href="/admin/complaints" className={backLinkClass}>
            ← Back to complaints
          </Link>
          <div
            className="rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-4 text-sm text-red-100 shadow-[0_0_28px_rgba(248,113,113,0.25)]"
            role="alert"
          >
            {error}
          </div>
        </div>
      </NeonShell>
    );
  }

  if (!complaint) return null;

  const reporterProfileHref =
    complaint.reporterType === "rider"
      ? `/admin/riders/${complaint.reporter.id}`
      : `/admin/clients/${complaint.reporter.id}`;

  const linkPillClass =
    "inline-flex rounded-lg border border-fuchsia-400/35 bg-fuchsia-500/15 px-3 py-1.5 text-sm font-semibold text-fuchsia-100 shadow-[0_0_16px_rgba(232,121,249,0.2)] transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/25";

  return (
    <NeonShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-col gap-6">
          <Link href="/admin/complaints" className={`${backLinkClass} w-fit`}>
            ← Back to complaints
          </Link>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(232,121,249,0.4)]">
                {complaint.subject}
              </span>
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className={reporterTypeNeonClass(complaint.reporterType)}>{complaint.reporterType}</span>
              <span className={complaintStatusNeonClass(complaint.status)}>
                {complaint.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="font-mono text-xs text-white/35">{complaint.id}</p>
          </div>
        </div>

        {error && complaint && (
          <div
            className="rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.2)]"
            role="alert"
          >
            {error}
          </div>
        )}

        <section className="space-y-4">
          <SectionTitle>Details</SectionTitle>
          <div className={`${glassCard} space-y-6`}>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow
                label="Reporter"
                value={
                  <Link href={reporterProfileHref} className={linkPillClass}>
                    {getReporterDisplayName(complaint.reporter)}
                  </Link>
                }
              />
              <DetailRow label="Email" value={complaint.reporter.email} />
              <DetailRow label="Contact phone" value={<span className="font-mono">{complaint.phone || "—"}</span>} />
              <DetailRow
                label="Account phone"
                value={<span className="font-mono">{complaint.reporter.phone || "—"}</span>}
              />
              <DetailRow label="Submitted" value={formatAdminDate(complaint.createdAt)} />
              <DetailRow label="Last updated" value={formatAdminDate(complaint.updatedAt)} />
              <DetailRow
                label="Related shipment"
                value={
                  complaint.relatedShipmentId ? (
                    <Link
                      href={`/admin/shipments/${complaint.relatedShipmentId}`}
                      className="inline-flex items-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 font-mono text-sm font-semibold text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.15)] transition hover:border-cyan-300/50 hover:bg-cyan-500/20"
                    >
                      #{shortShipmentId(complaint.relatedShipmentId)}
                    </Link>
                  ) : (
                    <span className="text-white/45">—</span>
                  )
                }
              />
            </dl>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fuchsia-200/60">Message</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/80">{complaint.message}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Update status</SectionTitle>
          <div className={`${glassCard} flex flex-wrap gap-3`}>
            {(["open", "in_review", "resolved"] as const).map((s) => {
              const isCurrent = complaint.status === s;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={actionLoading || isCurrent}
                  onClick={() => handleSetStatus(s)}
                  className={`min-h-[44px] rounded-xl border px-4 text-sm font-semibold capitalize transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isCurrent ? statusButtonActive[s] : statusButtonIdle
                  }`}
                >
                  {actionLoading ? "Updating…" : isCurrent ? `Current: ${s.replace(/_/g, " ")}` : `Mark ${s.replace(/_/g, " ")}`}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </NeonShell>
  );
}
