"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAdminDate, shortShipmentId } from "@/lib/admin-api";
import {
  getAdminComplaints,
  getReporterDisplayName,
  complaintStatusClass,
  reporterTypeClass,
  type AdminComplaintData,
} from "@/lib/complaints-api";

type ReporterFilter = "" | "client" | "rider";
type StatusFilter = "" | "open" | "in_review" | "resolved";

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<AdminComplaintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reporterType, setReporterType] = useState<ReporterFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    const res = await getAdminComplaints({
      reporterType: reporterType || undefined,
      status: status || undefined,
      limit: 200,
    });
    setLoading(false);
    if (res.success && res.data) {
      setComplaints(res.data);
      return;
    }
    const msg = res.message || "Failed to load complaints";
    if (msg.toLowerCase().includes("admin access") || msg.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(msg);
  }, [router, reporterType, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Complaints</h1>
      <p className="text-sm text-neutral-600">
        Complaints submitted by clients and riders. Filter by reporter type or status.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="flex-1 sm:max-w-[180px]">
          <span className="sr-only">Reporter type</span>
          <select
            value={reporterType}
            onChange={(e) => setReporterType(e.target.value as ReporterFilter)}
            className="w-full min-h-[44px] rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#81007f]"
          >
            <option value="">All reporters</option>
            <option value="client">Client</option>
            <option value="rider">Rider</option>
          </select>
        </label>
        <label className="flex-1 sm:max-w-[180px]">
          <span className="sr-only">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="w-full min-h-[44px] rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#81007f]"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_review">In review</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading complaints…</p>}
      {error && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      {!loading && !error && complaints.length === 0 && (
        <p className="text-sm text-neutral-500">No complaints match your filters.</p>
      )}
      {!loading && !error && complaints.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-left">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider hidden md:table-cell">
                  Shipment
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider hidden sm:table-cell">
                  Submitted
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900 max-w-[200px] truncate">
                    {c.subject}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {getReporterDisplayName(c.reporter)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={reporterTypeClass(c.reporterType)}>{c.reporterType}</span>
                  </td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell">
                    {c.relatedShipmentId ? (
                      <Link
                        href={`/admin/shipments/${c.relatedShipmentId}`}
                        className="font-mono text-[#81007f] hover:underline"
                      >
                        #{shortShipmentId(c.relatedShipmentId)}
                      </Link>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={complaintStatusClass(c.status)}>{c.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell whitespace-nowrap">
                    {formatAdminDate(c.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/complaints/${c.id}`}
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
    </div>
  );
}
