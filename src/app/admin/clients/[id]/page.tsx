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
  clientStatusClass,
  shipmentStatusClass,
  shortShipmentId,
  type AdminClientDetail,
  type AdminClientActivity,
  type ClientAccountStatus,
} from "@/lib/admin-api";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-base text-neutral-900">{value}</dd>
    </div>
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
    if (res.success && res.data) setClient(res.data);
    else setError(res.message || "Failed to update status");
  }

  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (error && !client) {
    return (
      <div>
        <Link href="/admin/clients" className="text-sm font-medium text-[#81007f] hover:underline">
          ← Back to clients
        </Link>
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!client) return null;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link href="/admin/clients" className="text-sm font-medium text-[#81007f] hover:underline">
          ← Back to clients
        </Link>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">{getAdminClientDisplayName(client)}</h1>
        <p className="mt-1 text-sm text-neutral-500">{client.email}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#81007f] uppercase tracking-wide">Profile</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailRow label="Phone" value={client.phone || "—"} />
          <DetailRow
            label="Email verified"
            value={client.isEmailVerified ? "Yes" : "No"}
          />
          <DetailRow label="Member since" value={formatAdminDate(client.createdAt)} />
          <DetailRow
            label="Account status"
            value={<span className={clientStatusClass(client.status)}>{client.status}</span>}
          />
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#81007f] uppercase tracking-wide">Summary</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DetailRow label="Total shipments" value={client.stats.totalShipments} />
          <DetailRow label="Active" value={client.stats.activeShipments} />
          <DetailRow label="Delivered" value={client.stats.deliveredCount} />
          <DetailRow label="Total spent" value={`₦${client.stats.totalSpent.toLocaleString()}`} />
        </dl>
      </section>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <section className="flex flex-wrap gap-3">
        {client.status !== "active" && (
          <button
            type="button"
            onClick={() => handleSetStatus("active")}
            disabled={actionLoading}
            className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {actionLoading ? "Updating…" : "Activate account"}
          </button>
        )}
        {client.status !== "suspended" && (
          <button
            type="button"
            onClick={() => handleSetStatus("suspended")}
            disabled={actionLoading}
            className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {actionLoading ? "Updating…" : "Suspend account"}
          </button>
        )}
        {client.status !== "blocked" && (
          <button
            type="button"
            onClick={() => handleSetStatus("blocked")}
            disabled={actionLoading}
            className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {actionLoading ? "Updating…" : "Block account"}
          </button>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#81007f] uppercase tracking-wide">Shipment history</h2>
        {!activity || activity.shipments.length === 0 ? (
          <p className="text-sm text-neutral-500">No shipments yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200 text-left">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase">Ref</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase hidden sm:table-cell">
                    Recipient
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase">Price</th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase hidden sm:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {activity.shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm font-mono">#{shortShipmentId(s.id)}</td>
                    <td className="px-4 py-3">
                      <span className={shipmentStatusClass(s.status)}>{s.status.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">{s.recipientName}</td>
                    <td className="px-4 py-3 text-sm">₦{s.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell whitespace-nowrap">
                      {formatAdminDate(s.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/shipments/${s.id}`}
                        className="text-sm font-medium text-[#81007f] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#81007f] uppercase tracking-wide">Feedback</h2>
        {!activity || activity.feedback.length === 0 ? (
          <p className="text-sm text-neutral-500">No feedback submitted.</p>
        ) : (
          <ul className="space-y-3">
            {activity.feedback.map((f) => (
              <li key={f.id} className="rounded-lg border border-neutral-200 p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-neutral-900">{f.rating} / 5</span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-neutral-500">{formatAdminDate(f.createdAt)}</span>
                  <Link
                    href={`/admin/shipments/${f.shipmentId}`}
                    className="text-[#81007f] font-medium hover:underline"
                  >
                    Shipment #{shortShipmentId(f.shipmentId)}
                  </Link>
                </div>
                {f.comment ? <p className="mt-2 text-sm text-neutral-700">{f.comment}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
