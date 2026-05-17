"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getRiderAddressBook, type RiderAddressBookEntry } from "@/lib/shipment-api";

const searchInputClass =
  "w-full rounded-xl border border-purple-200/70 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-500 transition focus:border-[#81007f] focus:outline-none focus:ring-2 focus:ring-[#81007f]/30 focus:shadow-[0_0_0_3px_rgba(129,0,127,0.12),0_0_24px_rgba(168,85,247,0.15)]";

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

function contactInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function roleBadgeClass(role: RiderAddressBookEntry["role"]): string {
  const base =
    "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-sm";
  if (role === "sender") {
    return `${base} bg-violet-100 text-violet-800 ring-1 ring-violet-300/80 shadow-[0_0_12px_rgba(139,92,246,0.4)]`;
  }
  return `${base} bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/80 shadow-[0_0_12px_rgba(16,185,129,0.4)]`;
}

function addressCardClass(role: RiderAddressBookEntry["role"]): string {
  const base =
    "relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01]";
  if (role === "sender") {
    return `${base} border-violet-200/80 bg-gradient-to-br from-white via-violet-50/35 to-fuchsia-50/20 shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_8px_32px_rgba(139,92,246,0.16),0_0_48px_rgba(217,70,239,0.1)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_12px_40px_rgba(139,92,246,0.26),0_0_64px_rgba(217,70,239,0.18)]`;
  }
  return `${base} border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/20 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_8px_32px_rgba(16,185,129,0.16),0_0_48px_rgba(34,211,238,0.1)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_12px_40px_rgba(16,185,129,0.26),0_0_64px_rgba(34,211,238,0.18)]`;
}

function accentBarClass(role: RiderAddressBookEntry["role"]): string {
  if (role === "sender") {
    return "h-0.5 w-full bg-gradient-to-r from-transparent via-violet-400 to-fuchsia-400 shadow-[0_0_12px_rgba(139,92,246,0.8)]";
  }
  return "h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]";
}

function avatarClass(role: RiderAddressBookEntry["role"]): string {
  if (role === "sender") {
    return "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-base font-bold text-white shadow-[0_4px_16px_rgba(139,92,246,0.4)]";
  }
  return "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-500 text-base font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.4)]";
}

function roleLabel(role: RiderAddressBookEntry["role"]): string {
  return role === "sender" ? "Sender (pickup)" : "Receiver (drop-off)";
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

function LocationPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  );
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

  const senderCount = useMemo(() => filtered.filter((e) => e.role === "sender").length, [filtered]);
  const receiverCount = useMemo(() => filtered.filter((e) => e.role === "recipient").length, [filtered]);

  const hasQuery = search.trim().length > 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-br from-[#81007f]/10 via-white to-fuchsia-50/50 px-5 py-5 shadow-[0_0_0_1px_rgba(129,0,127,0.15),0_8px_32px_rgba(129,0,127,0.12),0_0_56px_rgba(168,85,247,0.15)]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden />
        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#81007f] text-white shadow-[0_4px_20px_rgba(129,0,127,0.4),0_0_28px_rgba(168,85,247,0.35)]">
            <BookIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#81007f] drop-shadow-[0_0_12px_rgba(129,0,127,0.25)]">
              Address book
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Sender and receiver contacts from your deliveries, ready to reuse.
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#81007f]/60" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, address, phone, or role…"
          className={`${searchInputClass} pl-10`}
          aria-label="Search address book"
        />
      </div>

      {!loading && filtered.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-violet-100/90 px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-300/70 shadow-[0_0_12px_rgba(139,92,246,0.25)]">
            {senderCount} sender{senderCount === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-300/70 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            {receiverCount} receiver{receiverCount === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {loading && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading address book">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-purple-200/60 bg-gradient-to-r from-purple-100/70 via-fuchsia-50/50 to-purple-100/70 shadow-[0_0_24px_rgba(168,85,247,0.12),0_8px_32px_rgba(129,0,127,0.08)]"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_4px_24px_rgba(239,68,68,0.2),0_0_32px_rgba(239,68,68,0.15)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/50 px-6 py-12 text-center shadow-[inset_0_0_32px_rgba(168,85,247,0.08),0_0_48px_rgba(129,0,127,0.1)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(129,0,127,0.2),0_0_32px_rgba(168,85,247,0.25)]">
            <BookIcon className="h-7 w-7 text-[#81007f]/70" />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-800">No contacts yet</p>
          <p className="mt-1 text-sm text-neutral-500">
            Pick up or complete deliveries to build your address book.
          </p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && filtered.length === 0 && hasQuery && (
        <div className="rounded-2xl border border-dashed border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/50 px-6 py-12 text-center shadow-[inset_0_0_32px_rgba(168,85,247,0.08),0_0_48px_rgba(129,0,127,0.1)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(129,0,127,0.2),0_0_32px_rgba(168,85,247,0.25)]">
            <SearchIcon className="h-7 w-7 text-[#81007f]/70" />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-800">No matches</p>
          <p className="mt-1 text-sm text-neutral-500">
            Try a different name, address, phone number, or role.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="space-y-5">
          {filtered.map((e) => (
            <li key={`${e.role}-${e.address}`} className={addressCardClass(e.role)}>
              <div className={accentBarClass(e.role)} aria-hidden />
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={avatarClass(e.role)}>{contactInitial(e.fullName)}</div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-neutral-900 truncate">{e.fullName}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Last seen {formatSeen(e.lastSeenAt)}</p>
                    </div>
                  </div>
                  <span className={roleBadgeClass(e.role)}>{roleLabel(e.role)}</span>
                </div>
                <div
                  className={
                    e.role === "sender"
                      ? "rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-fuchsia-50/30 p-3 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                      : "rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-cyan-50/30 p-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  }
                >
                  <p className="flex items-start gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-700">
                    <LocationPinIcon
                      className={
                        e.role === "sender"
                          ? "mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600 drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]"
                          : "mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                      }
                    />
                    Address
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">{e.address}</p>
                </div>
                <p className="flex items-center gap-2 text-sm text-neutral-700">
                  <PhoneIcon className="h-4 w-4 shrink-0 text-[#81007f]/70" />
                  {e.phone || "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
