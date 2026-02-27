"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRiders, getRiderDisplayName, getRiderUser, type RiderData } from "@/lib/riders-api";

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<RiderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRiders().then((res) => {
      setLoading(false);
      if (res.success && res.data) setRiders(res.data);
      else setError(res.message || "Failed to load riders");
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Riders</h1>
        <Link href="/admin/riders/create" className="inline-flex justify-center items-center min-h-[44px] px-4 rounded-lg bg-[#81007f] text-white font-medium hover:bg-[#6a0068] focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2">
          Create rider
        </Link>
      </div>
      {loading && <p className="text-sm text-neutral-500">Loading riders...</p>}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && riders.length === 0 && (
        <p className="text-sm text-neutral-500">No riders yet. Create one to get started.</p>
      )}
      {!loading && !error && riders.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-left">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider hidden sm:table-cell">Available</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {riders.map((r) => {
                const user = getRiderUser(r);
                return (
                  <tr key={r._id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">{getRiderDisplayName(r)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{user?.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">{user?.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          r.status === "active"
                            ? "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800"
                            : r.status === "suspended"
                              ? "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800"
                              : r.status === "blocked"
                                ? "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800"
                                : "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-800"
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={r.isAvailable ? "font-medium text-neutral-900" : "text-neutral-500"}>
                        {r.isAvailable ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex flex-wrap gap-2">
                      <Link href={"/admin/riders/" + r._id} className="text-sm font-medium text-[#81007f] hover:underline">View</Link>
                      <Link href={"/admin/riders/" + r._id + "/edit"} className="text-sm font-medium text-[#81007f] hover:underline">Edit</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
