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
  shipmentStatusClass,
  shortShipmentId,
  type AdminShipmentDetail,
  type AdminShipmentRider,
} from "@/lib/admin-api";

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[#81007f] uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-base text-neutral-900">{value}</dd>
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

  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (error && !shipment) {
    return (
      <div>
        <Link href="/admin/shipments" className="text-sm font-medium text-[#81007f] hover:underline">
          ← Back to shipments
        </Link>
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!shipment) return null;

  const hasPickupWindow = shipment.pickupWindowStart && shipment.pickupWindowEnd;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link href="/admin/shipments" className="text-sm font-medium text-[#81007f] hover:underline">
          ← Back to shipments
        </Link>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">
          Shipment #{shortShipmentId(shipment.id)}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 font-mono">{shipment.id}</p>
      </div>

      <DetailSection title="Overview">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailRow
            label="Status"
            value={
              <span className={shipmentStatusClass(shipment.status)}>
                {shipment.status.replace(/_/g, " ")}
              </span>
            }
          />
          <DetailRow label="Delivery type" value={shipment.deliveryType} />
          <DetailRow label="Payment" value={shipment.paymentStatus} />
          <DetailRow label="Price" value={`₦${shipment.price.toLocaleString()}`} />
          <DetailRow label="Created" value={formatAdminDate(shipment.createdAt)} />
          <DetailRow label="Last updated" value={formatAdminDate(shipment.updatedAt)} />
        </dl>
      </DetailSection>

      <DetailSection title="Ordered by">
        <dl className="grid grid-cols-1 gap-3">
          <DetailRow label="Name" value={getClientDisplayName(shipment.client)} />
          <DetailRow label="Email" value={shipment.client.email} />
          <DetailRow label="Phone" value={shipment.client.phone || "—"} />
        </dl>
      </DetailSection>

      <DetailSection title="Rider assignment">
        <dl className="grid grid-cols-1 gap-3">
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
                    className="text-[#81007f] font-medium hover:underline"
                  >
                    View rider
                  </Link>
                }
              />
            </>
          ) : (
            <DetailRow label="Rider" value="Not assigned" />
          )}
          {shipment.riderResponseDeadline && (
            <DetailRow
              label="Rider response deadline"
              value={formatAdminDate(shipment.riderResponseDeadline)}
            />
          )}
          {shipment.declinedRiderCount > 0 && (
            <DetailRow
              label="Declined / timed out riders"
              value={String(shipment.declinedRiderCount)}
            />
          )}
        </dl>

        {canAssign && (
          <form onSubmit={handleAssign} className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3">
            <p className="text-sm font-medium text-neutral-800">Assign to available rider</p>
            <p className="text-xs text-neutral-600">
              The rider will receive a notification and must accept the offer before delivery proceeds.
            </p>
            {ridersLoading && <p className="text-sm text-neutral-500">Loading available riders…</p>}
            {!ridersLoading && availableRiders.length === 0 && (
              <p className="text-sm text-amber-700">No riders are currently available.</p>
            )}
            {!ridersLoading && availableRiders.length > 0 && (
              <label className="block">
                <span className="sr-only">Select rider</span>
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full min-h-[44px] rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#81007f]"
                >
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
              className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-[#81007f] text-white font-medium hover:bg-[#6a0068] focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2 disabled:opacity-60"
            >
              {assignLoading ? "Assigning…" : "Assign rider"}
            </button>
          </form>
        )}

        {assignSuccess && (
          <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800" role="status">
            {assignSuccess}
          </div>
        )}

        {error && shipment && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Pickup & delivery">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-neutral-200 p-4 space-y-2">
            <h3 className="text-sm font-medium text-neutral-700">Sender (pickup)</h3>
            <p className="text-sm font-medium text-neutral-900">{shipment.senderDetails.fullName}</p>
            <p className="text-sm text-neutral-600">{shipment.senderDetails.address}</p>
            <p className="text-sm text-neutral-600">{shipment.senderDetails.phone}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4 space-y-2">
            <h3 className="text-sm font-medium text-neutral-700">Recipient (drop-off)</h3>
            <p className="text-sm font-medium text-neutral-900">{shipment.recipientDetails.fullName}</p>
            <p className="text-sm text-neutral-600">{shipment.recipientDetails.address}</p>
            <p className="text-sm text-neutral-600">{shipment.recipientDetails.phone}</p>
          </div>
        </div>
        {hasPickupWindow && (
          <p className="text-sm text-neutral-600 mt-3">
            Pickup window: {formatAdminDate(shipment.pickupWindowStart!)} –{" "}
            {formatAdminDate(shipment.pickupWindowEnd!)}
          </p>
        )}
      </DetailSection>

      <DetailSection title="Package">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </DetailSection>

      <DetailSection title="Timeline">
        {shipment.timeline.length === 0 ? (
          <p className="text-sm text-neutral-500">No timeline entries yet.</p>
        ) : (
          <ol className="space-y-2 border-l-2 border-neutral-200 pl-4">
            {shipment.timeline.map((entry, i) => (
              <li key={`${entry.status}-${entry.timestamp}-${i}`} className="text-sm">
                <span className="font-medium text-neutral-900 capitalize">
                  {entry.status.replace(/_/g, " ")}
                </span>
                <span className="text-neutral-500"> · {formatAdminDate(entry.timestamp)}</span>
              </li>
            ))}
          </ol>
        )}
      </DetailSection>
    </div>
  );
}
