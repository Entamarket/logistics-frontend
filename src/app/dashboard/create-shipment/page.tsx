"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createShipment } from "@/lib/shipment-api";

const inputClass =
  "mt-1 block w-full min-h-[44px] rounded-lg border border-neutral-300 px-4 py-2.5 text-base text-neutral-900 placeholder-neutral-400 focus:border-[#81007f] focus:outline-none focus:ring-1 focus:ring-[#81007f]";
const labelClass = "block text-sm font-medium text-neutral-700";

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getToday(): string {
  return toDateString(new Date());
}

function getMaxPickupDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toDateString(d);
}

export default function CreateShipmentPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"instant" | "scheduled">("instant");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupWindowStart, setPickupWindowStart] = useState("");
  const [sender, setSender] = useState({ fullName: "", address: "", phone: "" });
  const [recipient, setRecipient] = useState({ fullName: "", address: "", phone: "" });
  const [pkg, setPkg] = useState({ type: "", weight: "", dimensions: "", quantity: "", note: "" });
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [calculatorMessage, setCalculatorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const weight = parseFloat(pkg.weight);
    const dimensions = parseFloat(pkg.dimensions);
    const quantity = parseInt(pkg.quantity, 10);
    if (isNaN(weight) || weight < 0 || isNaN(dimensions) || dimensions < 0 || isNaN(quantity) || quantity < 1) {
      setError("Please enter valid weight, dimensions, and quantity.");
      return;
    }

    if (deliveryType === "scheduled") {
      const today = getToday();
      const maxDate = getMaxPickupDate();
      if (!pickupDate.trim()) {
        setError("Please select a pickup date for scheduled delivery.");
        return;
      }
      if (!pickupWindowStart.trim()) {
        setError("Please select a pickup window start time for scheduled delivery.");
        return;
      }
      if (pickupDate < today) {
        setError("Pickup date cannot be in the past.");
        return;
      }
      if (pickupDate > maxDate) {
        setError("Pickup date cannot be more than 7 days ahead.");
        return;
      }
      const [year, month, day] = pickupDate.split("-").map(Number);
      const [hour, minute] = pickupWindowStart.split(":").map(Number);
      const pickupDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      if (pickupDateTime.getTime() < oneHourFromNow.getTime()) {
        setError("Pickup must be at least 1 hour from now.");
        return;
      }
    }

    setLoading(true);
    const payload: Parameters<typeof createShipment>[0] = {
      deliveryType,
      senderDetails: sender,
      recipientDetails: recipient,
      packageDetails: {
        type: pkg.type,
        weight,
        dimensions,
        quantity,
        note: pkg.note || undefined,
      },
    };
    if (deliveryType === "scheduled" && pickupDate && pickupWindowStart) {
      const [y, m, d] = pickupDate.split("-").map(Number);
      const [h, min] = pickupWindowStart.split(":").map(Number);
      const start = new Date(y, m - 1, d, h, min, 0, 0);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      payload.pickupWindowStart = start.toISOString();
      payload.pickupWindowEnd = end.toISOString();
    }
    const res = await createShipment(payload);
    setLoading(false);

    if (res.success) {
      setSuccess("Shipment created successfully.");
      setDeliveryType("instant");
      setPickupDate("");
      setPickupWindowStart("");
      setEstimatedCost(null);
      setCalculatorMessage("");
      setSender({ fullName: "", address: "", phone: "" });
      setRecipient({ fullName: "", address: "", phone: "" });
      setPkg({ type: "", weight: "", dimensions: "", quantity: "", note: "" });
      return;
    }

    if (res.message?.toLowerCase().includes("auth") || res.message?.toLowerCase().includes("token")) {
      router.replace("/auth/login");
      return;
    }
    setError(res.message);
  }

  function handleCalculateCost() {
    setCalculatorMessage("");
    setEstimatedCost(null);
    const w = pkg.weight.trim();
    if (!w) {
      setCalculatorMessage("Please enter weight in the package details above.");
      return;
    }
    const weight = parseFloat(w);
    if (isNaN(weight) || weight < 0) {
      setCalculatorMessage("Please enter a valid weight in the package details above.");
      return;
    }
    setEstimatedCost(Math.round(weight * 500));
  }

  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);
    return () => clearTimeout(t);
  }, [success, error]);

  return (
    <div className="max-w-2xl">
      {(success || error) && (
        <div className="fixed top-4 right-4 left-4 md:left-auto z-50 max-w-sm" role={error ? "alert" : "status"}>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 shadow-md">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 shadow-md">
              {success}
            </div>
          )}
        </div>
      )}

      <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Create shipment</h1>
      <p className="mt-1 text-sm text-neutral-600 mb-6">Enter sender, recipient, and package details.</p>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#81007f]">Sender details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div>
              <label htmlFor="sender-fullName" className={labelClass}>Full name</label>
              <input id="sender-fullName" type="text" required value={sender.fullName} onChange={(e) => setSender((s) => ({ ...s, fullName: e.target.value }))} className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="sender-address" className={labelClass}>Address</label>
              <input id="sender-address" type="text" required value={sender.address} onChange={(e) => setSender((s) => ({ ...s, address: e.target.value }))} className={inputClass} placeholder="Street, city, state" />
            </div>
            <div>
              <label htmlFor="sender-phone" className={labelClass}>Phone</label>
              <input id="sender-phone" type="tel" required value={sender.phone} onChange={(e) => setSender((s) => ({ ...s, phone: e.target.value }))} className={inputClass} placeholder="+1234567890" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#81007f]">Recipient details</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="recipient-fullName" className={labelClass}>Full name</label>
              <input id="recipient-fullName" type="text" required value={recipient.fullName} onChange={(e) => setRecipient((r) => ({ ...r, fullName: e.target.value }))} className={inputClass} placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="recipient-address" className={labelClass}>Address</label>
              <input id="recipient-address" type="text" required value={recipient.address} onChange={(e) => setRecipient((r) => ({ ...r, address: e.target.value }))} className={inputClass} placeholder="Street, city, state" />
            </div>
            <div>
              <label htmlFor="recipient-phone" className={labelClass}>Phone</label>
              <input id="recipient-phone" type="tel" required value={recipient.phone} onChange={(e) => setRecipient((r) => ({ ...r, phone: e.target.value }))} className={inputClass} placeholder="+1234567890" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#81007f]">Package details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pkg-type" className={labelClass}>Type</label>
              <input id="pkg-type" type="text" required value={pkg.type} onChange={(e) => setPkg((p) => ({ ...p, type: e.target.value }))} className={inputClass} placeholder="e.g. Box, Envelope" />
            </div>
            <div>
              <label htmlFor="pkg-weight" className={labelClass}>Weight (kg)</label>
              <input id="pkg-weight" type="number" step="0.01" min="0" required value={pkg.weight} onChange={(e) => setPkg((p) => ({ ...p, weight: e.target.value }))} className={inputClass} placeholder="0" />
            </div>
            <div>
              <label htmlFor="pkg-dimensions" className={labelClass}>Dimensions</label>
              <input id="pkg-dimensions" type="number" step="0.01" min="0" required value={pkg.dimensions} onChange={(e) => setPkg((p) => ({ ...p, dimensions: e.target.value }))} className={inputClass} placeholder="0" />
            </div>
            <div>
              <label htmlFor="pkg-quantity" className={labelClass}>Quantity</label>
              <input id="pkg-quantity" type="number" min="1" required value={pkg.quantity} onChange={(e) => setPkg((p) => ({ ...p, quantity: e.target.value }))} className={inputClass} placeholder="1" />
            </div>
          </div>
          <div>
            <label htmlFor="pkg-note" className={labelClass}>Note (optional)</label>
            <textarea id="pkg-note" rows={3} value={pkg.note} onChange={(e) => setPkg((p) => ({ ...p, note: e.target.value }))} className={inputClass + " min-h-[80px]"} placeholder="Special instructions" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#81007f]">Price calculator</h2>
          <p className="text-sm text-neutral-600">
            Cost is ₦500 per kg (rounded to the nearest whole number). Enter weight in Package details above, then click Calculate cost.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleCalculateCost}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-lg border-2 border-[#81007f] bg-white font-medium text-[#81007f] transition hover:bg-[#81007f] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2"
            >
              Calculate cost
            </button>
            {calculatorMessage && (
              <p className="text-sm text-amber-700 mt-1 sm:mt-0" role="status">
                {calculatorMessage}
              </p>
            )}
            {estimatedCost !== null && (
              <p className="text-base font-semibold text-neutral-900 mt-1 sm:mt-0" role="status">
                Estimated cost: ₦{estimatedCost.toLocaleString()}
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#81007f]">Delivery</h2>
          <fieldset className="space-y-3">
            <legend className={labelClass}>Delivery type</legend>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deliveryType"
                  value="instant"
                  checked={deliveryType === "instant"}
                  onChange={() => setDeliveryType("instant")}
                  className="h-4 w-4 border-neutral-300 text-[#81007f] focus:ring-[#81007f]"
                />
                <span className="text-neutral-900">Instant – pickup as soon as possible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deliveryType"
                  value="scheduled"
                  checked={deliveryType === "scheduled"}
                  onChange={() => setDeliveryType("scheduled")}
                  className="h-4 w-4 border-neutral-300 text-[#81007f] focus:ring-[#81007f]"
                />
                <span className="text-neutral-900">Scheduled – choose date and time window</span>
              </label>
            </div>
          </fieldset>
          {deliveryType === "scheduled" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="pickup-date" className={labelClass}>Pickup date</label>
                <input
                  id="pickup-date"
                  type="date"
                  required={deliveryType === "scheduled"}
                  min={getToday()}
                  max={getMaxPickupDate()}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="pickup-window-start" className={labelClass}>Pickup window start</label>
                <input
                  id="pickup-window-start"
                  type="time"
                  required={deliveryType === "scheduled"}
                  value={pickupWindowStart}
                  onChange={(e) => setPickupWindowStart(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-neutral-500">Pickup window is 2 hours starting at this time.</p>
              </div>
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] rounded-lg bg-[#81007f] px-4 py-3 font-medium text-white transition hover:bg-[#6a0068] active:bg-[#5a0058] focus:outline-none focus:ring-2 focus:ring-[#81007f] focus:ring-offset-2 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create shipment"}
        </button>
      </form>
    </div>
  );
}
