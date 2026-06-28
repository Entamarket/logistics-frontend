"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createShipment,
  estimateShipmentPrice,
  initializeShipmentPayment,
  verifyShipmentPayment,
  type ShipmentPaymentInit,
  type ShipmentPriceEstimate,
} from "@/lib/shipment-api";
import { openPaystackPayment } from "@/lib/paystack-inline";
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY_CODE } from "@/lib/location-data";
import { RegionSelect } from "@/components/RegionSelect";
import { WEIGHT_TIER_OPTIONS, weightKgFromTierId } from "@/lib/shipment-weight-tiers";
import { PACKAGE_SIZE_OPTIONS, dimensionsFromSizeTierId } from "@/lib/shipment-size-tiers";
import {
  ClientCostHighlight,
  ClientPageHeader,
  ClientSection,
  ClientShell,
  ClientToast,
  clientBtnPrimary,
  clientBtnSecondary,
  clientInputClass,
  clientInsetPanel,
  clientLabelClass,
} from "@/components/client/ClientUI";

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

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
  const [sender, setSender] = useState({
    fullName: "",
    address: "",
    phone: "",
    country: DEFAULT_COUNTRY_CODE,
    state: "",
  });
  const [recipient, setRecipient] = useState({
    fullName: "",
    address: "",
    phone: "",
    country: DEFAULT_COUNTRY_CODE,
    state: "",
  });
  const [pkg, setPkg] = useState({
    type: "",
    weightTier: "",
    sizeTier: "",
    quantity: "",
    note: "",
  });
  const [pickupCoords, setPickupCoords] = useState<{ longitude: number; latitude: number } | null>(
    null
  );
  const [recipientLongitude, setRecipientLongitude] = useState("");
  const [recipientLatitude, setRecipientLatitude] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<ShipmentPriceEstimate | null>(null);
  const [calculatorMessage, setCalculatorMessage] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [pendingPaymentShipmentId, setPendingPaymentShipmentId] = useState<string | null>(null);
  const estimateRequestId = useRef(0);

  function resetFormAfterPayment() {
    setDeliveryType("instant");
    setPickupDate("");
    setPickupWindowStart("");
    setPriceEstimate(null);
    setCalculatorMessage("");
    setSender({ fullName: "", address: "", phone: "", country: DEFAULT_COUNTRY_CODE, state: "" });
    setRecipient({ fullName: "", address: "", phone: "", country: DEFAULT_COUNTRY_CODE, state: "" });
    setPkg({ type: "", weightTier: "", sizeTier: "", quantity: "", note: "" });
    setPickupCoords(null);
  }

  function paymentErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }

  async function runPaymentFlow(
    shipmentId: string,
    options?: { resetFormOnSuccess?: boolean; incompletePaymentMessage?: string }
  ) {
    const initRes = await initializeShipmentPayment(shipmentId);
    if (!initRes.success || !initRes.data) {
      throw new Error(initRes.message || "Could not start payment.");
    }

    const init: ShipmentPaymentInit = initRes.data;
    if (init.alreadyPaid) {
      setPendingPaymentShipmentId(null);
      setPaying(false);
      setSuccess("Payment was already completed. Your shipment is confirmed.");
      if (options?.resetFormOnSuccess) {
        resetFormAfterPayment();
      }
      router.push("/dashboard/active");
      return;
    }

    await openPaystackPayment({
      accessCode: init.accessCode,
      publicKey: init.publicKey,
      email: init.email,
      amountKobo: init.amountKobo,
      reference: init.reference,
      onSuccess: async (paidReference) => {
        setPaying(true);
        const verifyRes = await verifyShipmentPayment(shipmentId, paidReference || init.reference);
        setPaying(false);
        if (verifyRes.success) {
          setPendingPaymentShipmentId(null);
          setSuccess("Payment successful. Your shipment is confirmed.");
          if (options?.resetFormOnSuccess) {
            resetFormAfterPayment();
          }
          router.push("/dashboard/active");
          return;
        }
        setError(verifyRes.message || "Payment verification failed.");
      },
      onClose: () => {
        setPaying(false);
        if (options?.incompletePaymentMessage) {
          setError(options.incompletePaymentMessage);
        }
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const weight = weightKgFromTierId(pkg.weightTier);
    const dimensions = dimensionsFromSizeTierId(pkg.sizeTier);
    const quantity = parseInt(pkg.quantity, 10);
    if (weight === null || dimensions === null || isNaN(quantity) || quantity < 1) {
      setError("Please select a weight range, package size, and enter a valid quantity.");
      return;
    }
    const { lengthCm, widthCm, heightCm } = dimensions;

    if (!sender.state.trim()) {
      setError("Please select the sender's state.");
      return;
    }
    if (!recipient.state.trim()) {
      setError("Please select the recipient's state.");
      return;
    }

    const recLonS = recipientLongitude.trim();
    const recLatS = recipientLatitude.trim();
    if ((recLonS && !recLatS) || (!recLonS && recLatS)) {
      setError("Provide both drop-off longitude and latitude, or leave both empty.");
      return;
    }
    if (recLonS && recLatS) {
      const rl = parseFloat(recLonS);
      const ra = parseFloat(recLatS);
      if (Number.isNaN(rl) || Number.isNaN(ra) || rl < -180 || rl > 180 || ra < -90 || ra > 90) {
        setError("Enter valid drop-off coordinates (longitude -180 to 180, latitude -90 to 90).");
        return;
      }
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
        lengthCm,
        widthCm,
        heightCm,
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
    if (deliveryType === "instant" && pickupCoords) {
      payload.pickupLongitude = pickupCoords.longitude;
      payload.pickupLatitude = pickupCoords.latitude;
    }
    if (recLonS && recLatS) {
      payload.recipientLongitude = parseFloat(recLonS);
      payload.recipientLatitude = parseFloat(recLatS);
    }
    const res = await createShipment(payload);
    if (!res.success) {
      setLoading(false);
      if (res.message?.toLowerCase().includes("auth") || res.message?.toLowerCase().includes("token")) {
        router.replace("/auth/login");
        return;
      }
      setError(res.message);
      return;
    }

    const shipmentId = res.data._id;
    setPendingPaymentShipmentId(shipmentId);
    setLoading(false);
    setPaying(true);
    setSuccess("Complete payment to confirm your shipment.");

    try {
      await runPaymentFlow(shipmentId, {
        resetFormOnSuccess: true,
        incompletePaymentMessage:
          "Payment was not completed. Use Retry payment below when you are ready.",
      });
    } catch (error) {
      setPaying(false);
      setError(
        paymentErrorMessage(error, "Could not open payment. Try again with Retry payment.")
      );
    }
  }

  async function handleRetryPayment() {
    if (!pendingPaymentShipmentId) return;
    setError("");
    setPaying(true);
    try {
      await runPaymentFlow(pendingPaymentShipmentId);
    } catch (error) {
      setPaying(false);
      setError(paymentErrorMessage(error, "Could not open payment."));
    }
  }

  function handleUsePickupLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setGeoLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickupCoords({
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        });
        setGeoLoading(false);
      },
      () => {
        setError("Could not read your location. We'll use your sender address to match a rider.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  const canEstimatePrice =
    Boolean(sender.state.trim() && sender.address.trim()) &&
    Boolean(recipient.state.trim() && recipient.address.trim());

  const runPriceEstimate = useCallback(async () => {
    setCalculatorMessage("");
    setPriceEstimate(null);

    if (!pkg.weightTier) {
      setCalculatorMessage("Please select a weight range in the package details above.");
      return;
    }
    const weight = weightKgFromTierId(pkg.weightTier);
    if (weight === null) {
      setCalculatorMessage("Please select a valid weight range in the package details above.");
      return;
    }
    if (!pkg.sizeTier) {
      setCalculatorMessage("Please select a package size in the package details above.");
      return;
    }
    const dimensions = dimensionsFromSizeTierId(pkg.sizeTier);
    if (dimensions === null) {
      setCalculatorMessage("Please select a valid package size in the package details above.");
      return;
    }
    const { lengthCm, widthCm, heightCm } = dimensions;
    if (!sender.state.trim() || !sender.address.trim()) {
      setCalculatorMessage("Complete sender state and address to estimate price.");
      return;
    }
    if (!recipient.state.trim() || !recipient.address.trim()) {
      setCalculatorMessage("Complete recipient state and address to estimate price.");
      return;
    }

    const requestId = ++estimateRequestId.current;
    setCalculating(true);
    try {
      const res = await estimateShipmentPrice({
        senderDetails: {
          fullName: sender.fullName.trim() || "Sender",
          address: sender.address.trim(),
          phone: sender.phone.trim() || "0000000000",
          country: sender.country,
          state: sender.state.trim(),
        },
        recipientDetails: {
          fullName: recipient.fullName.trim() || "Recipient",
          address: recipient.address.trim(),
          phone: recipient.phone.trim() || "0000000000",
          country: recipient.country,
          state: recipient.state.trim(),
        },
        weight,
        lengthCm,
        widthCm,
        heightCm,
      });
      if (requestId !== estimateRequestId.current) return;
      if (res.success && res.data) {
        setPriceEstimate(res.data);
      } else {
        setCalculatorMessage(res.message || "Could not estimate price.");
      }
    } catch {
      if (requestId !== estimateRequestId.current) return;
      setCalculatorMessage("Could not estimate price. Check addresses and try again.");
    } finally {
      if (requestId === estimateRequestId.current) {
        setCalculating(false);
      }
    }
  }, [pkg.weightTier, pkg.sizeTier, sender, recipient]);

  const hasValidSizeForEstimate = pkg.sizeTier !== "" && dimensionsFromSizeTierId(pkg.sizeTier) !== null;

  useEffect(() => {
    if (!canEstimatePrice || !pkg.weightTier || !hasValidSizeForEstimate) {
      setPriceEstimate(null);
      return;
    }
    const weight = weightKgFromTierId(pkg.weightTier);
    if (weight === null) return;

    const timer = setTimeout(() => {
      void runPriceEstimate();
    }, 600);
    return () => clearTimeout(timer);
  }, [
    sender.state,
    sender.address,
    sender.country,
    recipient.state,
    recipient.address,
    recipient.country,
    pkg.weightTier,
    pkg.sizeTier,
    canEstimatePrice,
    hasValidSizeForEstimate,
    runPriceEstimate,
  ]);

  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);
    return () => clearTimeout(t);
  }, [success, error]);

  const deliveryOptionClass = (selected: boolean) =>
    `flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition shadow-sm ${
      selected
        ? "border-[#81007f] bg-gradient-to-br from-[#faf8fb] to-fuchsia-50/40 shadow-[0_0_0_2px_rgba(129,0,127,0.12),0_0_24px_rgba(168,85,247,0.12)] ring-2 ring-[#81007f]/20"
        : "border-neutral-200/90 bg-white hover:border-purple-200 hover:shadow-[0_0_16px_rgba(129,0,127,0.08)]"
    }`;

  return (
    <ClientShell className="max-w-2xl">
      <ClientToast error={error || undefined} success={success || undefined} />

      <ClientPageHeader
        title="Create shipment"
        description="Enter sender, recipient, and package details. We’ll match a rider once you submit."
        icon={<PackageIcon className="h-6 w-6" />}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <ClientSection title="Sender details" accent="purple">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="sender-fullName" className={clientLabelClass}>
                Full name
              </label>
              <input
                id="sender-fullName"
                type="text"
                required
                value={sender.fullName}
                onChange={(e) => setSender((s) => ({ ...s, fullName: e.target.value }))}
                className={clientInputClass}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sender-country" className={clientLabelClass}>
                  Country
                </label>
                <select
                  id="sender-country"
                  required
                  value={sender.country}
                  onChange={(e) =>
                    setSender((s) => ({ ...s, country: e.target.value, state: "" }))
                  }
                  className={clientInputClass}
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <RegionSelect
                id="sender-state"
                countryCode={sender.country}
                value={sender.state}
                onChange={(state) => setSender((s) => ({ ...s, state }))}
                labelClassName={clientLabelClass}
                inputClassName={clientInputClass}
              />
            </div>
            <div>
              <label htmlFor="sender-address" className={clientLabelClass}>
                Address
              </label>
              <input
                id="sender-address"
                type="text"
                required
                value={sender.address}
                onChange={(e) => setSender((s) => ({ ...s, address: e.target.value }))}
                className={clientInputClass}
                placeholder="Street, area, landmark"
              />
            </div>
            <div>
              <label htmlFor="sender-phone" className={clientLabelClass}>
                Phone
              </label>
              <input
                id="sender-phone"
                type="tel"
                required
                value={sender.phone}
                onChange={(e) => setSender((s) => ({ ...s, phone: e.target.value }))}
                className={clientInputClass}
                placeholder="+1234567890"
              />
            </div>
          </div>
          {deliveryType === "instant" && (
            <div className={`${clientInsetPanel} mt-4 space-y-3`}>
              <p className="text-sm text-neutral-600">
                We match the nearest rider using your sender address. Optionally share your current location
                for a more precise pickup point.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleUsePickupLocation}
                  disabled={geoLoading}
                  className="text-sm font-semibold text-[#81007f] hover:underline disabled:opacity-60"
                >
                  {geoLoading ? "Getting location…" : "Use my current location"}
                </button>
                {pickupCoords ? (
                  <>
                    <p className="text-sm text-emerald-700" role="status">
                      Location saved for rider matching.
                    </p>
                    <button
                      type="button"
                      onClick={() => setPickupCoords(null)}
                      className="text-sm text-neutral-500 hover:text-neutral-700 hover:underline"
                    >
                      Use sender address instead
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </ClientSection>

        <ClientSection
          title="Recipient details"
          description="Optional coordinates improve map accuracy; leave blank to geocode from the address."
          accent="violet"
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="recipient-fullName" className={clientLabelClass}>
                Full name
              </label>
              <input
                id="recipient-fullName"
                type="text"
                required
                value={recipient.fullName}
                onChange={(e) => setRecipient((r) => ({ ...r, fullName: e.target.value }))}
                className={clientInputClass}
                placeholder="Jane Doe"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="recipient-country" className={clientLabelClass}>
                  Country
                </label>
                <select
                  id="recipient-country"
                  required
                  value={recipient.country}
                  onChange={(e) =>
                    setRecipient((r) => ({ ...r, country: e.target.value, state: "" }))
                  }
                  className={clientInputClass}
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <RegionSelect
                id="recipient-state"
                countryCode={recipient.country}
                value={recipient.state}
                onChange={(state) => setRecipient((r) => ({ ...r, state }))}
                labelClassName={clientLabelClass}
                inputClassName={clientInputClass}
              />
            </div>
            <div>
              <label htmlFor="recipient-address" className={clientLabelClass}>
                Address
              </label>
              <input
                id="recipient-address"
                type="text"
                required
                value={recipient.address}
                onChange={(e) => setRecipient((r) => ({ ...r, address: e.target.value }))}
                className={clientInputClass}
                placeholder="Street, area, landmark"
              />
            </div>
            <div>
              <label htmlFor="recipient-phone" className={clientLabelClass}>
                Phone
              </label>
              <input
                id="recipient-phone"
                type="tel"
                required
                value={recipient.phone}
                onChange={(e) => setRecipient((r) => ({ ...r, phone: e.target.value }))}
                className={clientInputClass}
                placeholder="+1234567890"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="recipient-lng" className={clientLabelClass}>
                  Drop-off longitude <span className="font-normal text-neutral-500">(optional)</span>
                </label>
                <input
                  id="recipient-lng"
                  type="number"
                  step="any"
                  value={recipientLongitude}
                  onChange={(e) => setRecipientLongitude(e.target.value)}
                  className={clientInputClass}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label htmlFor="recipient-lat" className={clientLabelClass}>
                  Drop-off latitude <span className="font-normal text-neutral-500">(optional)</span>
                </label>
                <input
                  id="recipient-lat"
                  type="number"
                  step="any"
                  value={recipientLatitude}
                  onChange={(e) => setRecipientLatitude(e.target.value)}
                  className={clientInputClass}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        </ClientSection>

        <ClientSection title="Package details" accent="purple">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pkg-type" className={clientLabelClass}>
                Type
              </label>
              <input
                id="pkg-type"
                type="text"
                required
                value={pkg.type}
                onChange={(e) => setPkg((p) => ({ ...p, type: e.target.value }))}
                className={clientInputClass}
                placeholder="e.g. Box, Envelope"
              />
            </div>
            <div>
              <label htmlFor="pkg-weightTier" className={clientLabelClass}>
                Weight range
              </label>
              <select
                id="pkg-weightTier"
                required
                value={pkg.weightTier}
                onChange={(e) => setPkg((p) => ({ ...p, weightTier: e.target.value }))}
                className={clientInputClass}
              >
                <option value="">Select weight range</option>
                {WEIGHT_TIER_OPTIONS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pkg-sizeTier" className={clientLabelClass}>
                Package size
              </label>
              <select
                id="pkg-sizeTier"
                required
                value={pkg.sizeTier}
                onChange={(e) => setPkg((p) => ({ ...p, sizeTier: e.target.value }))}
                className={clientInputClass}
              >
                <option value="">Select package size</option>
                {PACKAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.dropdownLabel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pkg-quantity" className={clientLabelClass}>
                Quantity
              </label>
              <input
                id="pkg-quantity"
                type="number"
                min="1"
                required
                value={pkg.quantity}
                onChange={(e) => setPkg((p) => ({ ...p, quantity: e.target.value }))}
                className={clientInputClass}
                placeholder="1"
              />
            </div>
          </div>
          <div>
            <label htmlFor="pkg-note" className={clientLabelClass}>
              Note (optional)
            </label>
            <textarea
              id="pkg-note"
              rows={3}
              value={pkg.note}
              onChange={(e) => setPkg((p) => ({ ...p, note: e.target.value }))}
              className={`${clientInputClass} min-h-[88px]`}
              placeholder="Special instructions"
            />
          </div>
        </ClientSection>

        <ClientSection
          title="Price calculator"
          description="Updates when addresses, weight range, or package size change."
          accent="amber"
        >
          <div className="space-y-3">
            <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => void runPriceEstimate()}
                disabled={calculating}
                className={clientBtnSecondary}
              >
                {calculating ? "Calculating…" : "Calculate cost"}
              </button>
              {calculatorMessage ? (
                <p className="text-sm text-amber-800" role="status">
                  {calculatorMessage}
                </p>
              ) : null}
              {priceEstimate !== null ? <ClientCostHighlight amount={priceEstimate.total} /> : null}
            </div>
          </div>
        </ClientSection>

        <ClientSection title="Delivery" accent="purple">
          <fieldset className="space-y-3">
            <legend className={clientLabelClass}>Delivery type</legend>
            <div className="grid gap-3 sm:grid-cols-1">
              <label className={deliveryOptionClass(deliveryType === "instant")}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="instant"
                  checked={deliveryType === "instant"}
                  onChange={() => setDeliveryType("instant")}
                  className="mt-1 h-4 w-4 border-neutral-300 text-[#81007f] focus:ring-[#81007f]"
                />
                <span>
                  <span className="block font-semibold text-neutral-900">Instant</span>
                  <span className="text-sm text-neutral-600">Pickup as soon as possible</span>
                </span>
              </label>
              <label className={deliveryOptionClass(deliveryType === "scheduled")}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="scheduled"
                  checked={deliveryType === "scheduled"}
                  onChange={() => {
                    setDeliveryType("scheduled");
                    setPickupCoords(null);
                  }}
                  className="mt-1 h-4 w-4 border-neutral-300 text-[#81007f] focus:ring-[#81007f]"
                />
                <span>
                  <span className="block font-semibold text-neutral-900">Scheduled</span>
                  <span className="text-sm text-neutral-600">Choose date and 2-hour pickup window</span>
                </span>
              </label>
            </div>
          </fieldset>
          {deliveryType === "scheduled" && (
            <div className={`${clientInsetPanel} mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2`}>
              <div>
                <label htmlFor="pickup-date" className={clientLabelClass}>
                  Pickup date
                </label>
                <input
                  id="pickup-date"
                  type="date"
                  required={deliveryType === "scheduled"}
                  min={getToday()}
                  max={getMaxPickupDate()}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className={clientInputClass}
                />
              </div>
              <div>
                <label htmlFor="pickup-window-start" className={clientLabelClass}>
                  Pickup window start
                </label>
                <input
                  id="pickup-window-start"
                  type="time"
                  required={deliveryType === "scheduled"}
                  value={pickupWindowStart}
                  onChange={(e) => setPickupWindowStart(e.target.value)}
                  className={clientInputClass}
                />
                <p className="mt-1 text-xs text-neutral-500">Pickup window is 2 hours starting at this time.</p>
              </div>
            </div>
          )}
        </ClientSection>

        {pendingPaymentShipmentId ? (
          <button
            type="button"
            onClick={() => void handleRetryPayment()}
            disabled={paying}
            className={`${clientBtnSecondary} w-full`}
          >
            {paying ? "Processing payment…" : "Retry payment"}
          </button>
        ) : null}
        <button type="submit" disabled={loading || paying} className={`${clientBtnPrimary} w-full`}>
          {loading ? "Creating…" : paying ? "Awaiting payment…" : "Create shipment & pay"}
        </button>
      </form>
    </ClientShell>
  );
}
