"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getAdminShipmentById,
  getAdminAvailableRiders,
  assignAdminShipmentToRider,
  canAdminAssignShipment,
  getClientDisplayName,
  getAdminRiderDisplayName,
  formatAdminDate,
  shipmentStatusNeonClass,
  shortShipmentId,
  type AdminShipmentDetail,
  type AdminShipmentRider,
} from "@/lib/admin-api";

const backLinkClass =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 shadow-[0_0_18px_rgba(232,121,249,0.12)] transition hover:border-fuchsia-400/35 hover:bg-fuchsia-500/10 hover:shadow-[0_0_24px_rgba(232,121,249,0.25)]";

const glassCard = "rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

const selectClass =
  "w-full min-h-[44px] rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:border-fuchsia-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30";

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

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/75">{title}</h2>
      {children}
    </section>
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

export default function AdminShipmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [shipment, setShipment] = useState<AdminShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableRiders, setAvailableRiders] = useState<AdminShipmentRider[]>([]);
  const [ridersLoading, setRidersLoading] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState("");

  useEffect(() => {
    getAdminShipmentById(id).then((res) => {
      setLoading(false);
      if (res.success && res.data) setShipment(res.data);
      else setError(res.message || "Shipment not found");
    });
  }, [id]);

  const canAssign = shipment ? canAdminAssignShipment(shipment.status) : false;

  useEffect(() => {
    if (!canAssign) {
      setAvailableRiders([]);
      setSelectedRiderId("");
      return;
    }
    let cancelled = false;
    setRidersLoading(true);
    getAdminAvailableRiders().then((res) => {
      if (cancelled) return;
      setRidersLoading(false);
      if (res.success && res.data) {
        setAvailableRiders(res.data);
        if (res.data.length > 0) setSelectedRiderId(res.data[0].riderId);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [canAssign, shipment?.status]);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRiderId) return;
    setAssignSuccess("");
    setError("");
    setAssignLoading(true);
    const res = await assignAdminShipmentToRider(id, selectedRiderId);
    setAssignLoading(false);
    if (res.success && res.data) {
      setShipment(res.data);
      setAssignSuccess(res.message || "Rider assigned successfully.");
      return;
    }
    setError(res.message || "Failed to assign rider");
  }

  if (loading) {
    return (
      <NeonShell>
        <div
          className="flex max-w-3xl items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          role="status"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
          Loading shipment…
        </div>
      </NeonShell>
    );
  }

  if (error && !shipment) {
    return (
      <NeonShell>
        <div className="max-w-3xl space-y-6">
          <Link href="/admin/shipments" className={backLinkClass}>
            ← Back to shipments
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

  if (!shipment) return null;

  const hasPickupWindow = shipment.pickupWindowStart && shipment.pickupWindowEnd;

  return (
    <NeonShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <Link href="/admin/shipments" className={`${backLinkClass} w-fit shrink-0`}>
            ← Back to shipments
          </Link>
          <div className="min-w-0 flex-1 space-y-3 sm:text-right">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 font-mono text-sm font-bold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.2)] sm:ml-auto">
              #{shortShipmentId(shipment.id)}
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(232,121,249,0.4)]">
                Shipment detail
              </span>
            </h1>
            <p className="break-all font-mono text-xs text-white/40">{shipment.id}</p>
          </div>
        </div>

        <DetailSection title="Overview">
          <div className={`${glassCard} grid grid-cols-1 gap-4 sm:grid-cols-2`}>
            <dl className="contents">
              <DetailRow
                label="Status"
                value={
                  <span className={shipmentStatusNeonClass(shipment.status)}>
                    {shipment.status.replace(/_/g, " ")}
                  </span>
                }
              />
              <DetailRow
                label="Delivery type"
                value={<span className="capitalize text-white/90">{shipment.deliveryType}</span>}
              />
              <DetailRow
                label="Payment"
                value={<span className="capitalize text-white/90">{shipment.paymentStatus}</span>}
              />
              <DetailRow
                label="Price"
                value={<span className="font-mono text-emerald-200/95">₦{shipment.price.toLocaleString()}</span>}
              />
              <DetailRow label="Created" value={formatAdminDate(shipment.createdAt)} />
              <DetailRow label="Last updated" value={formatAdminDate(shipment.updatedAt)} />
            </dl>
          </div>
        </DetailSection>

        <DetailSection title="Ordered by">
          <div className={`${glassCard} grid grid-cols-1 gap-4`}>
            <dl className="contents">
              <DetailRow label="Name" value={getClientDisplayName(shipment.client)} />
              <DetailRow label="Email" value={shipment.client.email} />
              <DetailRow label="Phone" value={shipment.client.phone || "—"} />
            </dl>
          </div>
        </DetailSection>

        <DetailSection title="Rider assignment">
          <div className={`${glassCard} space-y-4`}>
            <dl className="grid grid-cols-1 gap-4">
              <DetailRow label="Assignment" value={shipment.assignmentLabel} />
              {shipment.rider ? (
                <>
                  <DetailRow label="Rider name" value={getAdminRiderDisplayName(shipment.rider)} />
                  <DetailRow label="Rider email" value={shipment.rider.email} />
                  <DetailRow label="Rider phone" value={shipment.rider.phone || "—"} />
                  <DetailRow
                    label="Rider profile"
                    value={
                      <Link
                        href={`/admin/riders/${shipment.rider!.riderId}`}
                        className="inline-flex rounded-lg border border-fuchsia-400/35 bg-fuchsia-500/15 px-3 py-1.5 text-sm font-semibold text-fuchsia-100 shadow-[0_0_16px_rgba(232,121,249,0.2)] transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/25"
                      >
                        View rider
                      </Link>
                    }
                  />
                </>
              ) : (
                <DetailRow label="Rider" value={<span className="text-white/45">Not assigned</span>} />
              )}
              {shipment.riderResponseDeadline && (
                <DetailRow
                  label="Rider response deadline"
                  value={formatAdminDate(shipment.riderResponseDeadline)}
                />
              )}
              {shipment.declinedRiderCount > 0 && (
                <DetailRow label="Declined / timed out riders" value={String(shipment.declinedRiderCount)} />
              )}
            </dl>

            {canAssign && (
              <form
                onSubmit={handleAssign}
                className="space-y-4 rounded-xl border border-fuchsia-500/25 bg-fuchsia-950/20 p-4 shadow-[0_0_28px_rgba(129,0,127,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <p className="text-sm font-semibold text-white/95">Assign to available rider</p>
                <p className="text-xs leading-relaxed text-white/50">
                  The rider will receive a notification and must accept the offer before delivery proceeds.
                </p>
                {ridersLoading && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
                    Loading available riders…
                  </div>
                )}
                {!ridersLoading && availableRiders.length === 0 && (
                  <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                    No riders are currently available.
                  </p>
                )}
                {!ridersLoading && availableRiders.length > 0 && (
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-fuchsia-200/70">
                      Select rider
                    </span>
                    <select value={selectedRiderId} onChange={(e) => setSelectedRiderId(e.target.value)} className={selectClass}>
                      {availableRiders.map((r) => (
                        <option key={r.riderId} value={r.riderId}>
                          {getAdminRiderDisplayName(r)} — {r.email}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <button
                  type="submit"
                  disabled={assignLoading || ridersLoading || availableRiders.length === 0}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-[#81007f] to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(129,0,127,0.45)] ring-1 ring-white/15 transition hover:shadow-[0_0_36px_rgba(217,70,239,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50"
                >
                  {assignLoading ? "Assigning…" : "Assign rider"}
                </button>
              </form>
            )}

            {assignSuccess && (
              <div
                className="rounded-xl border border-emerald-400/35 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                role="status"
              >
                {assignSuccess}
              </div>
            )}

            {error && shipment && (
              <div
                className="rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.2)]"
                role="alert"
              >
                {error}
              </div>
            )}
          </div>
        </DetailSection>

        <DetailSection title="Pickup & delivery">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={`${glassCard} space-y-2`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-200/65">Sender (pickup)</h3>
              <p className="text-sm font-semibold text-white">{shipment.senderDetails.fullName}</p>
              <p className="text-sm text-white/55">{shipment.senderDetails.address}</p>
              <p className="text-sm font-mono text-white/50">{shipment.senderDetails.phone}</p>
            </div>
            <div className={`${glassCard} space-y-2`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-200/65">Recipient (drop-off)</h3>
              <p className="text-sm font-semibold text-white">{shipment.recipientDetails.fullName}</p>
              <p className="text-sm text-white/55">{shipment.recipientDetails.address}</p>
              <p className="text-sm font-mono text-white/50">{shipment.recipientDetails.phone}</p>
            </div>
          </div>
          {hasPickupWindow && (
            <p className="text-sm text-white/50">
              Pickup window: {formatAdminDate(shipment.pickupWindowStart!)} –{" "}
              {formatAdminDate(shipment.pickupWindowEnd!)}
            </p>
          )}
        </DetailSection>

        <DetailSection title="Package">
          <div className={`${glassCard} grid grid-cols-1 gap-4 sm:grid-cols-2`}>
            <dl className="contents">
              <DetailRow label="Type" value={shipment.packageDetails.type} />
              <DetailRow label="Weight (kg)" value={shipment.packageDetails.weight} />
              <DetailRow label="Dimensions" value={shipment.packageDetails.dimensions} />
              <DetailRow label="Quantity" value={shipment.packageDetails.quantity} />
              {shipment.packageDetails.note ? (
                <div className="sm:col-span-2">
                  <DetailRow label="Note" value={shipment.packageDetails.note} />
                </div>
              ) : null}
            </dl>
          </div>
        </DetailSection>

        <DetailSection title="Timeline">
          {shipment.timeline.length === 0 ? (
            <p className="text-sm text-white/45">No timeline entries yet.</p>
          ) : (
            <ol className="relative space-y-3 border-l-2 border-fuchsia-500/35 pl-5 shadow-[inset_4px_0_24px_-8px_rgba(232,121,249,0.15)]">
              {shipment.timeline.map((entry, i) => (
                <li key={`${entry.status}-${entry.timestamp}-${i}`} className="relative text-sm">
                  <span
                    className="absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full border border-fuchsia-400/60 bg-fuchsia-500 shadow-[0_0_10px_rgba(232,121,249,0.6)]"
                    aria-hidden
                  />
                  <span className="font-semibold capitalize text-white/95">{entry.status.replace(/_/g, " ")}</span>
                  <span className="text-white/45"> · {formatAdminDate(entry.timestamp)}</span>
                </li>
              ))}
            </ol>
          )}
        </DetailSection>
      </div>
    </NeonShell>
  );
}
