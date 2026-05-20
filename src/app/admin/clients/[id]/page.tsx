"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getAdminClientById,
  getAdminClientActivity,
  updateAdminClientStatus,
  getAdminClientDisplayName,
  formatAdminDate,
  clientStatusNeonClass,
  shipmentStatusNeonClass,
  shortShipmentId,
  type AdminClientDetail,
  type AdminClientActivity,
  type ClientAccountStatus,
} from "@/lib/admin-api";

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

export default function AdminClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<AdminClientDetail | null>(null);
  const [activity, setActivity] = useState<AdminClientActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [detailRes, activityRes] = await Promise.all([
        getAdminClientById(id),
        getAdminClientActivity(id),
      ]);
      if (cancelled) return;
      setLoading(false);
      if (detailRes.success && detailRes.data) setClient(detailRes.data);
      else setError(detailRes.message || "Client not found");
      if (activityRes.success && activityRes.data) setActivity(activityRes.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSetStatus(newStatus: ClientAccountStatus) {
    if (!client) return;
    setActionLoading(true);
    setError("");
    const res = await updateAdminClientStatus(client.id, newStatus);
    setActionLoading(false);
    if (res.success && res.data) {
      setClient(res.data);
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
          Loading client…
        </div>
      </NeonShell>
    );
  }

  if (error && !client) {
    return (
      <NeonShell>
        <div className="max-w-3xl space-y-6">
          <Link href="/admin/clients" className={backLinkClass}>
            ← Back to clients
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

  if (!client) return null;

  const initial = getAdminClientDisplayName(client).charAt(0).toUpperCase();

  return (
    <NeonShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <Link href="/admin/clients" className={`${backLinkClass} w-fit shrink-0`}>
            ← Back to clients
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/30 to-violet-600/25 text-xl font-bold text-fuchsia-100 shadow-[0_0_28px_rgba(192,38,211,0.45)]">
              {initial}
            </span>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(232,121,249,0.4)]">
                  {getAdminClientDisplayName(client)}
                </span>
              </h1>
              <p className="break-all text-sm text-white/55">{client.email}</p>
              <p className="break-all font-mono text-xs text-white/35">{client.id}</p>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <SectionTitle>Profile</SectionTitle>
          <div className={`${glassCard} grid grid-cols-1 gap-4 sm:grid-cols-2`}>
            <DetailRow label="Phone" value={<span className="font-mono text-white/85">{client.phone || "—"}</span>} />
            <DetailRow
              label="Email verified"
              value={
                client.isEmailVerified ? (
                  <span className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                    Yes
                  </span>
                ) : (
                  <span className="text-white/45">No</span>
                )
              }
            />
            <DetailRow label="Member since" value={formatAdminDate(client.createdAt)} />
            <DetailRow
              label="Account status"
              value={<span className={clientStatusNeonClass(client.status)}>{client.status}</span>}
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>Summary</SectionTitle>
          <div className={`${glassCard} grid grid-cols-2 gap-4 sm:grid-cols-4`}>
            <DetailRow label="Total shipments" value={client.stats.totalShipments} />
            <DetailRow label="Active" value={client.stats.activeShipments} />
            <DetailRow label="Delivered" value={client.stats.deliveredCount} />
            <DetailRow
              label="Total spent"
              value={<span className="font-mono text-emerald-200/95">₦{client.stats.totalSpent.toLocaleString()}</span>}
            />
          </div>
        </section>

        {error && client && (
          <div
            className="rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.2)]"
            role="alert"
          >
            {error}
          </div>
        )}

        <section className="flex flex-wrap gap-3">
          {client.status !== "active" && (
            <button
              type="button"
              onClick={() => handleSetStatus("active")}
              disabled={actionLoading}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-600/25 px-5 text-sm font-semibold text-emerald-100 shadow-[0_0_22px_rgba(52,211,153,0.25)] transition hover:bg-emerald-600/35 disabled:opacity-50"
            >
              {actionLoading ? "Updating…" : "Activate account"}
            </button>
          )}
          {client.status !== "suspended" && (
            <button
              type="button"
              onClick={() => handleSetStatus("suspended")}
              disabled={actionLoading}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-400/45 bg-amber-600/25 px-5 text-sm font-semibold text-amber-100 shadow-[0_0_22px_rgba(251,191,36,0.2)] transition hover:bg-amber-600/35 disabled:opacity-50"
            >
              {actionLoading ? "Updating…" : "Suspend account"}
            </button>
          )}
          {client.status !== "blocked" && (
            <button
              type="button"
              onClick={() => handleSetStatus("blocked")}
              disabled={actionLoading}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-400/45 bg-red-600/25 px-5 text-sm font-semibold text-red-100 shadow-[0_0_22px_rgba(248,113,113,0.22)] transition hover:bg-red-600/35 disabled:opacity-50"
            >
              {actionLoading ? "Updating…" : "Block account"}
            </button>
          )}
        </section>

        <section className="space-y-4">
          <SectionTitle>Shipment history</SectionTitle>
          {!activity || activity.shipments.length === 0 ? (
            <p className="text-sm text-white/45">No shipments yet.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_-10px_rgba(129,0,127,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        Ref
                      </th>
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        Status
                      </th>
                      <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 sm:table-cell">
                        Recipient
                      </th>
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        Price
                      </th>
                      <th className="hidden px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70 sm:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/70">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activity.shipments.map((s) => (
                      <tr
                        key={s.id}
                        className="transition-colors hover:bg-white/[0.06] hover:shadow-[inset_0_0_40px_rgba(129,0,127,0.08)]"
                      >
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 font-mono text-sm font-semibold text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.15)]">
                            #{shortShipmentId(s.id)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={shipmentStatusNeonClass(s.status)}>{s.status.replace(/_/g, " ")}</span>
                        </td>
                        <td className="hidden px-4 py-4 text-sm text-white/60 sm:table-cell">{s.recipientName}</td>
                        <td className="px-4 py-4 font-mono text-sm text-white/90">₦{s.price.toLocaleString()}</td>
                        <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-white/50 sm:table-cell">
                          {formatAdminDate(s.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/shipments/${s.id}`}
                            className="inline-block rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-100 shadow-[0_0_14px_rgba(232,121,249,0.15)] transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/20 hover:shadow-[0_0_20px_rgba(232,121,249,0.35)]"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionTitle>Feedback</SectionTitle>
          {!activity || activity.feedback.length === 0 ? (
            <p className="text-sm text-white/45">No feedback submitted.</p>
          ) : (
            <ul className="space-y-3">
              {activity.feedback.map((f) => (
                <li
                  key={f.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_-8px_rgba(129,0,127,0.2)]"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold text-white">{f.rating} / 5</span>
                    <span className="text-white/30">·</span>
                    <span className="text-white/45">{formatAdminDate(f.createdAt)}</span>
                    <Link
                      href={`/admin/shipments/${f.shipmentId}`}
                      className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-semibold text-fuchsia-100 shadow-[0_0_12px_rgba(232,121,249,0.15)] transition hover:border-fuchsia-300/50"
                    >
                      Shipment #{shortShipmentId(f.shipmentId)}
                    </Link>
                  </div>
                  {f.comment ? <p className="mt-3 text-sm leading-relaxed text-white/70">{f.comment}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </NeonShell>
  );
}
