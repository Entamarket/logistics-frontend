"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  confirmShipmentReceipt,
  getShipmentById,
  initializeShipmentPayment,
  verifyShipmentPayment,
  type ShipmentData,
} from "@/lib/shipment-api";
import { formatContactLocation } from "@/lib/location-data";
import { formatShipmentStatus } from "@/lib/shipment-status";
import { openPaystackPayment } from "@/lib/paystack-inline";
import { ShipmentProgressTracker } from "@/components/ShipmentProgressTracker";
import { ClientActiveShipmentMap } from "@/components/maps/ClientActiveShipmentMap";
import { ShipmentMap } from "@/components/maps/ShipmentMap";
import { OpenInGoogleMapsButton } from "@/components/maps/OpenInGoogleMapsButton";

const TERMINAL_STATUSES = new Set(["delivered", "cancelled"]);
const CONFIRMABLE_STATUSES = new Set(["rider_assigned", "picked_up", "in_transit"]);
const PAYABLE_STATUSES = new Set(["pending", "scheduled"]);

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function toMapLatLng(lon?: number, lat?: number) {
  if (lon == null || lat == null || Number.isNaN(lon) || Number.isNaN(lat)) return null;
  return { lng: lon, lat };
}

function statusPillClass(status: string): string {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1";
  switch (status) {
    case "delivered":
      return `${base} bg-emerald-100 text-emerald-800 ring-emerald-200/80`;
    case "in_transit":
    case "picked_up":
    case "rider_assigned":
    case "searching_rider":
      return `${base} bg-sky-100 text-sky-800 ring-sky-200/80`;
    case "awaiting_rider_response":
      return `${base} bg-violet-100 text-violet-800 ring-violet-200/80`;
    case "scheduled":
    case "pending":
      return `${base} bg-amber-100 text-amber-800 ring-amber-200/80`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800 ring-red-200/80`;
    default:
      return `${base} bg-neutral-100 text-neutral-800 ring-neutral-200/80`;
  }
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-purple-100/90 bg-white shadow-lg shadow-purple-500/10">
      <div className="h-1 bg-gradient-to-r from-[#81007f] via-purple-500 to-fuchsia-400" aria-hidden />
      <div className="p-5">
        <h2 className="text-base font-bold text-neutral-900">{title}</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">{children}</dl>
      </div>
    </section>
  );
}

function Field({ label, value, wide = false }: { label: string; value: ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-purple-100/80 bg-purple-50/30 px-3.5 py-3 ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#81007f]/80">{label}</dt>
      <dd className="mt-1 break-words text-sm text-neutral-800">{value}</dd>
    </div>
  );
}

function MapLegend() {
  const items = [
    { letter: "P", label: "Pickup" },
    { letter: "D", label: "Drop-off" },
    { letter: "R", label: "Rider" },
  ];
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

export default function ShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const res = await getShipmentById(id);
    if (res.success && res.data) {
      setShipment(res.data);
      setError("");
      return;
    }
    const message = res.message?.toLowerCase() ?? "";
    if (message.includes("auth") || message.includes("token")) {
      router.replace("/auth/login");
      return;
    }
    setError(res.message || "Failed to load shipment");
  }, [id, router]);

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

  const isTerminal = shipment ? TERMINAL_STATUSES.has(shipment.status) : false;
  const hasShipment = shipment != null;

  useEffect(() => {
    if (!hasShipment || isTerminal) return;
    const t = setInterval(() => void load(), 20_000);
    return () => clearInterval(t);
  }, [hasShipment, isTerminal, load]);

  async function handleCopy() {
    if (!shipment) return;
    try {
      await navigator.clipboard.writeText(shipment._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleConfirmReceipt() {
    if (!shipment) return;
    setNotice("");
    setConfirming(true);
    const res = await confirmShipmentReceipt(shipment._id);
    setConfirming(false);
    if (res.success) {
      setNotice("Receipt confirmed. Your rider can now mark the delivery complete.");
      await load();
      return;
    }
    setNotice(res.message || "Could not confirm receipt.");
  }

  async function handlePay() {
    if (!shipment) return;
    setNotice("");
    setPaying(true);
    try {
      const initRes = await initializeShipmentPayment(shipment._id);
      if (!initRes.success || !initRes.data) {
        throw new Error(initRes.message || "Could not start payment.");
      }
      const init = initRes.data;
      if (init.alreadyPaid) {
        setPaying(false);
        await load();
        return;
      }
      await openPaystackPayment({
        accessCode: init.accessCode,
        publicKey: init.publicKey,
        email: init.email,
        amountKobo: init.amountKobo,
        reference: init.reference,
        onSuccess: async (paidReference) => {
          const verifyRes = await verifyShipmentPayment(shipment._id, paidReference || init.reference);
          setPaying(false);
          if (!verifyRes.success) {
            setNotice(verifyRes.message || "Payment verification failed.");
          }
          await load();
        },
        onClose: () => setPaying(false),
      });
    } catch (e) {
      setPaying(false);
      setNotice(e instanceof Error ? e.message : "Could not start payment.");
    }
  }

  const backHref = isTerminal ? "/dashboard/history" : "/dashboard/active";
  const backLabel = isTerminal ? "Back to history" : "Back to active shipments";

  if (loading) {
    return (
      <div className="max-w-4xl space-y-4" aria-busy="true" aria-label="Loading shipment">
        <div className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-36 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-[50vh] animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="max-w-4xl space-y-4">
        <Link href="/dashboard/active" className="text-sm font-medium text-[#81007f] hover:underline">
          ← Back to active shipments
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error || "Shipment not found"}
        </div>
      </div>
    );
  }

  const pickup = toMapLatLng(shipment.pickupLongitude, shipment.pickupLatitude);
  const recipient = toMapLatLng(shipment.recipientLongitude, shipment.recipientLatitude);
  const canPay = PAYABLE_STATUSES.has(shipment.status) && shipment.paymentStatus !== "paid";
  const pkg = shipment.packageDetails;

  return (
    <div className="max-w-4xl space-y-6">
      <Link href={backHref} className="inline-block text-sm font-medium text-[#81007f] hover:underline">
        ← {backLabel}
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-[#81007f]/8 via-white to-fuchsia-50/40 px-5 py-5 shadow-md shadow-purple-500/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#81007f]/80">Shipment ID</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="break-all font-mono text-lg font-bold text-neutral-900 sm:text-xl">{shipment._id}</p>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="shrink-0 rounded-lg border border-purple-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#81007f] transition hover:bg-purple-50"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              To {shipment.recipientDetails.fullName} · Created {formatDate(shipment.createdAt)}
            </p>
          </div>
          <span className={statusPillClass(shipment.status)}>{formatShipmentStatus(shipment.status)}</span>
        </div>
      </div>

      <ShipmentProgressTracker status={shipment.status} paymentStatus={shipment.paymentStatus} />

      {notice && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-[#6a0068]" role="status">
          {notice}
        </div>
      )}

      {canPay && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-amber-900">Payment pending</p>
            <p className="mt-0.5 text-xs text-amber-800">
              Pay ₦{shipment.price.toLocaleString()} to confirm this shipment and start rider matching.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handlePay()}
            disabled={paying}
            className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#81007f] px-5 text-sm font-semibold text-white shadow-md shadow-purple-900/20 transition hover:bg-[#6a0068] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {paying ? "Processing…" : "Pay now"}
          </button>
        </div>
      )}

      {shipment.status === "awaiting_rider_response" && shipment.riderResponseDeadline && (
        <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          Waiting for a rider to accept the offer by{" "}
          <span className="font-semibold">{formatDate(shipment.riderResponseDeadline)}</span>.
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-purple-100/90 bg-white shadow-lg shadow-purple-500/10">
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-neutral-900">
              {isTerminal ? "Route" : "Live tracking"}
            </h2>
            <MapLegend />
          </div>
          {isTerminal ? (
            <ShipmentMap
              pickup={pickup}
              recipient={recipient}
              rider={null}
              recipientAddress={recipient ? undefined : shipment.recipientDetails.address}
              activeLeg="to_dropoff"
              showDirections={false}
              height="60vh"
            />
          ) : (
            <ClientActiveShipmentMap shipment={shipment} height="60vh" />
          )}
          <div className="flex flex-wrap gap-2">
            <OpenInGoogleMapsButton
              origin={pickup}
              destination={recipient}
              destinationQuery={recipient ? undefined : formatContactLocation(shipment.recipientDetails)}
              label="Open route in Google Maps"
            />
          </div>
        </div>
      </section>

      {CONFIRMABLE_STATUSES.has(shipment.status) && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-900">Delivery confirmation</p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-800/90">
            Confirm when the recipient has received the package. This lets your rider complete the delivery without
            uploading a photo.
          </p>
          {shipment.senderConfirmedReceipt ? (
            <p className="mt-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
              Confirmed
              {shipment.senderConfirmedReceiptAt ? ` · ${formatDate(shipment.senderConfirmedReceiptAt)}` : ""}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => void handleConfirmReceipt()}
              disabled={confirming}
              className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#81007f] px-4 text-sm font-semibold text-white shadow-md shadow-purple-900/20 transition hover:bg-[#6a0068] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirming ? "Confirming…" : "Confirm recipient received package"}
            </button>
          )}
        </div>
      )}

      {shipment.deliveryProofImageUrl && (
        <section className="overflow-hidden rounded-2xl border border-purple-100/90 bg-white p-5 shadow-lg shadow-purple-500/10">
          <h2 className="text-base font-bold text-neutral-900">Proof of delivery</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shipment.deliveryProofImageUrl}
            alt="Proof of delivery"
            className="mt-4 max-h-96 w-full rounded-xl object-contain ring-1 ring-purple-100"
          />
        </section>
      )}

      <DetailSection title="Sender & pickup">
        <Field label="Full name" value={shipment.senderDetails.fullName} />
        <Field label="Phone" value={shipment.senderDetails.phone} />
        <Field label="Address" value={formatContactLocation(shipment.senderDetails)} wide />
        {shipment.pickupWindowStart && (
          <Field
            label="Pickup window"
            value={`${formatDate(shipment.pickupWindowStart)}${
              shipment.pickupWindowEnd ? ` – ${formatDate(shipment.pickupWindowEnd)}` : ""
            }`}
            wide
          />
        )}
      </DetailSection>

      <DetailSection title="Recipient & drop-off">
        <Field label="Full name" value={shipment.recipientDetails.fullName} />
        <Field label="Phone" value={shipment.recipientDetails.phone} />
        <Field label="Address" value={formatContactLocation(shipment.recipientDetails)} wide />
      </DetailSection>

      <DetailSection title="Package">
        <Field label="Type" value={pkg.type} />
        <Field label="Quantity" value={pkg.quantity} />
        <Field label="Weight" value={`${pkg.weight} kg`} />
        <Field label="Dimensions" value={`${pkg.lengthCm} × ${pkg.widthCm} × ${pkg.heightCm} cm`} />
        {pkg.note?.trim() ? <Field label="Note" value={pkg.note} wide /> : null}
      </DetailSection>

      <DetailSection title="Delivery & payment">
        <Field label="Delivery type" value={shipment.deliveryType === "scheduled" ? "Scheduled" : "Instant"} />
        <Field label="Price" value={`₦${shipment.price.toLocaleString()}`} />
        <Field label="Payment status" value={<span className="capitalize">{shipment.paymentStatus}</span>} />
        <Field label="Last updated" value={formatDate(shipment.updatedAt)} />
      </DetailSection>

      <section className="overflow-hidden rounded-2xl border border-purple-100/90 bg-white p-5 shadow-lg shadow-purple-500/10">
        <h2 className="text-base font-bold text-neutral-900">Timeline</h2>
        {shipment.timeline.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No updates yet.</p>
        ) : (
          <ol className="mt-4 space-y-3 border-l-2 border-purple-100 pl-4">
            {[...shipment.timeline].reverse().map((entry, i) => (
              <li key={`${entry.status}-${entry.timestamp}-${i}`} className="relative">
                <span
                  className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#81007f]"
                  aria-hidden
                />
                <p className="text-sm font-semibold text-neutral-900">{formatShipmentStatus(entry.status)}</p>
                <p className="text-xs text-neutral-500">{formatDate(entry.timestamp)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
