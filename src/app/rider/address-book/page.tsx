"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getRiderAddressBook, type RiderAddressBookEntry } from "@/lib/shipment-api";
import {
  RiderEmptyState,
  RiderErrorAlert,
  RiderLoadingBlock,
  RiderPageHeader,
  RiderShell,
  riderCard,
  riderCardAccentAmber,
  riderCardAccentPurple,
  riderInputClass,
  riderNeonBoxAmber,
  riderNeonBoxPurple,
} from "@/components/rider/RiderUI";

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

function roleBadge(role: RiderAddressBookEntry["role"]): string {
  const base = "inline-flex rounded-full px-3 py-1 text-xs font-bold";
  return role === "sender"
    ? `${base} bg-amber-100 text-amber-900 ring-1 ring-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.22)]`
    : `${base} bg-purple-100 text-[#6a0068] ring-1 ring-purple-200 shadow-[0_0_12px_rgba(129,0,127,0.22)]`;
}

function avatarClass(role: RiderAddressBookEntry["role"]): string {
  return role === "sender"
    ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-base font-bold text-white ring-1 ring-white/30 shadow-[0_0_20px_rgba(245,158,11,0.4),0_4px_14px_rgba(234,88,12,0.25)]"
    : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6a0068] to-[#81007f] text-base font-bold text-white ring-1 ring-white/25 shadow-[0_4px_16px_rgba(129,0,127,0.45),0_0_28px_rgba(217,70,239,0.35)]";
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
    <RiderShell className="max-w-2xl">
      <div className="space-y-6">
        <RiderPageHeader
          badge="Contacts"
          title="Address book"
          description="Sender and receiver contacts from your deliveries, ready to reuse."
          icon={<BookIcon className="h-6 w-6" />}
        />

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#81007f]/70" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, address, phone, or role…"
            className={`${riderInputClass} mt-0 pl-10`}
            aria-label="Search address book"
          />
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800 ring-1 ring-violet-200">
              {senderCount} sender{senderCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
              {receiverCount} receiver{receiverCount === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {loading && <RiderLoadingBlock label="Loading address book…" />}
        {!loading && error && <RiderErrorAlert>{error}</RiderErrorAlert>}

        {!loading && !error && entries.length === 0 && (
          <RiderEmptyState
            icon={<BookIcon className="h-7 w-7" />}
            title="No contacts yet"
            description="Pick up or complete deliveries to build your address book."
          />
        )}

        {!loading && !error && entries.length > 0 && filtered.length === 0 && hasQuery && (
          <RiderEmptyState
            icon={<SearchIcon className="h-7 w-7" />}
            title="No matches"
            description="Try a different name, address, phone number, or role."
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="space-y-4">
            {filtered.map((e) => (
              <li key={`${e.role}-${e.address}`} className={riderCard}>
                <div className={e.role === "sender" ? riderCardAccentAmber : riderCardAccentPurple} aria-hidden />
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={avatarClass(e.role)}>{contactInitial(e.fullName)}</div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">{e.fullName}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Last seen {formatSeen(e.lastSeenAt)}</p>
                      </div>
                    </div>
                    <span className={roleBadge(e.role)}>{roleLabel(e.role)}</span>
                  </div>
                  <div className={e.role === "sender" ? riderNeonBoxAmber : riderNeonBoxPurple}>
                    <p className="flex items-start gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-700">
                      <LocationPinIcon
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${e.role === "sender" ? "text-amber-600" : "text-[#81007f]"}`}
                      />
                      Address
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{e.address}</p>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-slate-700">
                    <PhoneIcon className="h-4 w-4 shrink-0 text-[#81007f]" />
                    {e.phone || "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RiderShell>
  );
}
