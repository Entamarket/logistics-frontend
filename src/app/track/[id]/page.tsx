"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPublicShipmentStatus, type PublicShipmentStatus } from "@/lib/shipment-api";
import { formatShipmentStatus, landingShipmentStatusClass } from "@/lib/shipment-status";
import { ShipmentProgressTracker } from "@/components/ShipmentProgressTracker";
import { ShipmentMap } from "@/components/maps/ShipmentMap";
import { LandingBrand } from "@/components/landing/LandingBrand";
import { LandingFooter } from "@/components/landing/LandingFooter";

const TERMINAL_STATUSES = new Set(["delivered", "cancelled"]);
const RIDER_VISIBLE_STATUSES = new Set(["rider_assigned", "picked_up", "in_transit"]);
const EN_ROUTE_TO_DROPOFF = new Set(["picked_up", "in_transit"]);
const REFRESH_MS = 15_000;

function shortRef(id: string): string {
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function journeyMessage(status: string, hasRider: boolean): string {
  if (status === "delivered") return "This package has been delivered.";
  if (status === "cancelled") return "This shipment was cancelled.";
  if (!RIDER_VISIBLE_STATUSES.has(status)) return "No rider is assigned yet. The map shows the drop-off point.";
  if (!hasRider) return "A rider is assigned. Their location will appear once their device shares GPS.";
  if (EN_ROUTE_TO_DROPOFF.has(status)) return "The rider has the package and is heading to the drop-off point.";
  return "The rider is on the way to collect the package.";
}

function MapLegend({ showRider }: { showRider: boolean }) {
  const items = [{ letter: "D", label: "Drop-off" }, ...(showRider ? [{ letter: "R", label: "Rider" }] : [])];
  return (
    <div className="flex flex-wrap gap-3 text-xs text-neutral-600">
      {items.map((item) => (
        <span key={item.letter} className="inline-flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {item.letter}
          </span>
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default function PublicTrackingPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? decodeURIComponent(params.id) : "";
  const [data, setData] = useState<PublicShipmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    const res = await getPublicShipmentStatus(id);
    if (res.success && res.data) {
      setData(res.data);
      setError("");
      return;
    }
    setError(res.message || "Shipment not found. Check the ID and try again.");
  }, [id]);

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

  const isTerminal = data ? TERMINAL_STATUSES.has(data.status) : false;
  const hasData = data != null;

  useEffect(() => {
    if (!hasData || isTerminal) return;
    const t = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(t);
  }, [hasData, isTerminal, load]);

  const showRider = data ? RIDER_VISIBLE_STATUSES.has(data.status) : false;
  const riderPos = showRider && data?.rider ? { lat: data.rider.latitude, lng: data.rider.longitude } : null;
  const dropoffPos = data?.dropoff ? { lat: data.dropoff.latitude, lng: data.dropoff.longitude } : null;
  const hasMapPoints = Boolean(riderPos || dropoffPos);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf8fb] text-neutral-900">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute -left-1/4 -top-1/4 h-[70vh] w-[70vh] rounded-full bg-gradient-to-br from-fuchsia-300/40 via-[#81007f]/15 to-transparent blur-3xl" />
        <div className="absolute -right-1/4 top-1/3 h-[50vh] w-[50vh] rounded-full bg-gradient-to-bl from-violet-300/30 to-transparent blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-purple-100/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <LandingBrand />
          <Link
            href="/"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#81007f] transition hover:bg-[#81007f]/5"
          >
            Track another
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 sm:py-14">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#81007f]">Live tracking</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            {data ? `Shipment #${shortRef(data.shipmentId)}` : "Track your shipment"}
          </h1>
        </div>

        {loading && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading shipment">
            <div className="h-28 animate-pulse rounded-2xl bg-neutral-100" />
            <div className="h-[50vh] animate-pulse rounded-2xl bg-neutral-100" />
          </div>
        )}

        {!loading && error && !data && (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
            <Link href="/" className="text-sm font-semibold text-[#81007f] hover:underline">
              ← Try another shipment ID
            </Link>
          </div>
        )}

        {!loading && data && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm text-neutral-600">
                {data.deliveryType === "scheduled" ? "Scheduled delivery" : "Instant delivery"}
                {" · "}
                Last updated {formatDate(data.updatedAt)}
              </p>
              <span className={landingShipmentStatusClass(data.status)}>{formatShipmentStatus(data.status)}</span>
            </div>

            <ShipmentProgressTracker status={data.status} paymentStatus={data.paymentStatus} />

            <section className="overflow-hidden rounded-2xl border border-purple-100/90 bg-white shadow-lg shadow-purple-500/10">
              <div className="space-y-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-neutral-900">Map</h2>
                  {hasMapPoints ? <MapLegend showRider={Boolean(riderPos)} /> : null}
                </div>
                <p className="text-xs text-neutral-600">{journeyMessage(data.status, Boolean(data.rider))}</p>
                {hasMapPoints ? (
                  <ShipmentMap
                    pickup={null}
                    recipient={dropoffPos}
                    rider={riderPos}
                    activeLeg="to_dropoff"
                    showDirections={EN_ROUTE_TO_DROPOFF.has(data.status)}
                    height="60vh"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-purple-200 bg-purple-50/40 px-4 text-center text-sm text-neutral-500">
                    No location is available to show on the map yet.
                  </div>
                )}
                {!isTerminal && (
                  <p className="text-[11px] text-neutral-400">Updates automatically every 15 seconds.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
