"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getRiderAddressBook, type RiderAddressBookEntry } from "@/lib/shipment-api";

function formatSeen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function matchesQuery(entry: RiderAddressBookEntry, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [entry.fullName, entry.address, entry.phone, entry.role === "sender" ? "sender" : "receiver"]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export default function RiderAddressBookPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<RiderAddressBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await getRiderAddressBook();
    if (res.success && res.data) {
      setEntries(res.data);
      return;
    }
    if (res.message?.toLowerCase().includes("rider access") || res.message?.toLowerCase().includes("auth")) {
      router.replace("/auth/login");
      return;
    }
    setError(res.message || "Could not load address book.");
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const filtered = useMemo(() => entries.filter((e) => matchesQuery(e, search)), [entries, search]);

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Address book</h1>
        <p className="mt-4 text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Address book</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Sender and receiver contacts from deliveries assigned to you. Duplicates are merged by address.
        </p>
      </div>

      <div>
        <label htmlFor="address-book-search" className="sr-only">
          Search addresses
        </label>
        <input
          id="address-book-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, address, phone, or sender / receiver"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]"
          autoComplete="off"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {entries.length === 0
            ? "No saved addresses yet. Addresses appear here after you are assigned to a shipment."
            : "No entries match your search."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((e) => (
            <li
              key={`${e.role}-${e.address}`}
              className="rounded-lg border border-neutral-200 bg-white p-4 text-sm shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    e.role === "sender"
                      ? "bg-violet-100 text-violet-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {e.role === "sender" ? "Sender (pickup)" : "Receiver (drop-off)"}
                </span>
                <span className="text-xs text-neutral-500">{formatSeen(e.lastSeenAt)}</span>
              </div>
              <p className="mt-2 font-medium text-neutral-900">{e.fullName || "—"}</p>
              <p className="mt-1 text-neutral-700">{e.address}</p>
              <p className="mt-1 text-neutral-600">{e.phone || "—"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
