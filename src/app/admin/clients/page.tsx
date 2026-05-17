"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAdminClients,
  getAdminClientDisplayName,
  formatAdminDate,
  clientStatusClass,
  type AdminClientListItem,
} from "@/lib/admin-api";

export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<AdminClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    const res = await getAdminClients({
      q: debouncedSearch || undefined,
      limit: 100,
    });
    setLoading(false);
    if (res.success && res.data) {
      setClients(res.data);
      return;
    }
    const msg = res.message || "Failed to load clients";
    if (msg.toLowerCase().includes("admin access") || msg.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(msg);
  }, [router, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Clients</h1>
        <label className="flex-1 sm:max-w-xs">
          <span className="sr-only">Search clients</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full min-h-[44px] rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#81007f]"
          />
        </label>
      </div>

      {loading && <p className="text-sm text-neutral-500">Loading clients…</p>}
      {error && (
        <div
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      {!loading && !error && clients.length === 0 && (
        <p className="text-sm text-neutral-500">
          {debouncedSearch ? "No clients match your search." : "No clients yet."}
        </p>
      )}
      {!loading && !error && clients.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200 text-left">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider hidden md:table-cell">
                  Phone
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider hidden sm:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">Shipments</th>
                <th className="px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                    {getAdminClientDisplayName(c)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className={clientStatusClass(c.status)}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell whitespace-nowrap">
                    {formatAdminDate(c.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900">{c.shipmentCount}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${c.id}`} className="text-sm font-medium text-[#81007f] hover:underline">
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
