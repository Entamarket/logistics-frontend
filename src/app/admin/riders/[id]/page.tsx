"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getRiderById, updateRiderStatus, getRiderDisplayName, getRiderUser, type RiderData } from "@/lib/riders-api";

export default function RiderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [rider, setRider] = useState<RiderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getRiderById(id).then((res) => {
      setLoading(false);
      if (res.success && res.data) setRider(res.data);
      else setError(res.message || "Rider not found");
    });
  }, [id]);

  async function handleSetStatus(newStatus: "active" | "suspended" | "blocked") {
    if (!rider) return;
    setActionLoading(true);
    const res = await updateRiderStatus(rider._id, newStatus);
    setActionLoading(false);
    if (res.success && res.data) setRider(res.data);
    else setError(res.message || "Failed to update status");
  }

  if (loading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (error && !rider) {
    return (
      <div>
        <Link href="/admin/riders" className="text-sm font-medium text-[#81007f] hover:underline">← Back to riders</Link>
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!rider) return null;

  const user = getRiderUser(rider);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/admin/riders" className="text-sm font-medium text-[#81007f] hover:underline">← Back to riders</Link>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">{getRiderDisplayName(rider)}</h1>

      <dl className="grid grid-cols-1 gap-3">
        <div>
          <dt className="text-sm font-medium text-neutral-500">Email</dt>
          <dd className="mt-0.5 text-base text-neutral-900">{user?.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-neutral-500">Phone</dt>
          <dd className="mt-0.5 text-base text-neutral-900">{user?.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-neutral-500">Status</dt>
          <dd className="mt-0.5">
            <span
              className={
                rider.status === "active"
                  ? "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800"
                  : rider.status === "suspended"
                    ? "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800"
                    : rider.status === "blocked"
                      ? "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800"
                      : "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-800"
              }
            >
              {rider.status}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-neutral-500">Available</dt>
          <dd className="mt-0.5 text-base text-neutral-900">{rider.isAvailable ? "Yes" : "No"}</dd>
        </div>
      </dl>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/riders/${rider._id}/edit`}
          className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg border-2 border-[#81007f] bg-white font-medium text-[#81007f] hover:bg-[#81007f] hover:text-white"
        >
          Edit rider
        </Link>
        {rider.status !== "active" && (
          <button
            type="button"
            onClick={() => handleSetStatus("active")}
            disabled={actionLoading}
            className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {actionLoading ? "Updating…" : "Activate rider"}
          </button>
        )}
        {rider.status !== "suspended" && (
          <button
            type="button"
            onClick={() => handleSetStatus("suspended")}
            disabled={actionLoading}
            className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {actionLoading ? "Updating…" : "Suspend rider"}
          </button>
        )}
        {rider.status !== "blocked" && (
          <button
            type="button"
            onClick={() => handleSetStatus("blocked")}
            disabled={actionLoading}
            className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {actionLoading ? "Updating…" : "Block rider"}
          </button>
        )}
      </div>
    </div>
  );
}
