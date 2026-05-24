"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createShipment,
  dimensionCategoryLabel,
  estimateShipmentPrice,
  initializeShipmentPayment,
  verifyShipmentPayment,
  type ShipmentPaymentInit,
  type ShipmentPriceEstimate,
} from "@/lib/shipment-api";
import { openPaystackPayment } from "@/lib/paystack-inline";
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY_CODE, NIGERIA_STATES } from "@/lib/location-data";
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
    weight: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    quantity: "",
    note: "",
  });
  const [pickupLongitude, setPickupLongitude] = useState("");
  const [pickupLatitude, setPickupLatitude] = useState("");
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
    setPkg({ type: "", weight: "", lengthCm: "", widthCm: "", heightCm: "", quantity: "", note: "" });
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
    const weight = parseFloat(pkg.weight);
    const lengthCm = parseFloat(pkg.lengthCm);
    const widthCm = parseFloat(pkg.widthCm);
    const heightCm = parseFloat(pkg.heightCm);
    const quantity = parseInt(pkg.quantity, 10);
    if (
      isNaN(weight) ||
      weight < 0 ||
      isNaN(lengthCm) ||
      lengthCm < 0 ||
      isNaN(widthCm) ||
      widthCm < 0 ||
      isNaN(heightCm) ||
      heightCm < 0 ||
      isNaN(quantity) ||
      quantity < 1
    ) {
      setError("Please enter valid weight, length, width, height (cm), and quantity.");
      return;
    }

    if (!sender.state.trim()) {
      setError("Please select the sender's state.");
      return;
    }
    if (!recipient.state.trim()) {
      setError("Please select the recipient's state.");
      return;
    }

    if (deliveryType === "instant") {
      const lng = parseFloat(pickupLongitude);
      const lat = parseFloat(pickupLatitude);
      if (pickupLongitude.trim() === "" || pickupLatitude.trim() === "") {
        setError("Pickup longitude and latitude are required for instant delivery so we can assign the nearest rider.");
        return;
      }
      if (Number.isNaN(lng) || Number.isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        setError("Enter valid pickup coordinates (longitude -180 to 180, latitude -90 to 90).");
        return;
      }
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
    if (deliveryType === "instant") {
      payload.pickupLongitude = parseFloat(pickupLongitude);
      payload.pickupLatitude = parseFloat(pickupLatitude);
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
        setPickupLongitude(String(pos.coords.longitude));
        setPickupLatitude(String(pos.coords.latitude));
        setGeoLoading(false);
      },
      () => {
        setError("Could not read your location. Enter coordinates manually.");
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
    const lengthCm = parseFloat(pkg.lengthCm);
    const widthCm = parseFloat(pkg.widthCm);
    const heightCm = parseFloat(pkg.heightCm);
    if (
      isNaN(lengthCm) ||
      lengthCm < 0 ||
      isNaN(widthCm) ||
      widthCm < 0 ||
      isNaN(heightCm) ||
      heightCm < 0
    ) {
      setCalculatorMessage("Please enter valid length, width, and height (cm) in the package details above.");
      return;
    }
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
  }, [pkg.weight, pkg.lengthCm, pkg.widthCm, pkg.heightCm, sender, recipient]);

  const hasValidDimensionsForEstimate =
    pkg.lengthCm.trim() !== "" &&
    pkg.widthCm.trim() !== "" &&
    pkg.heightCm.trim() !== "" &&
    !isNaN(parseFloat(pkg.lengthCm)) &&
    !isNaN(parseFloat(pkg.widthCm)) &&
    !isNaN(parseFloat(pkg.heightCm)) &&
    parseFloat(pkg.lengthCm) >= 0 &&
    parseFloat(pkg.widthCm) >= 0 &&
    parseFloat(pkg.heightCm) >= 0;

  useEffect(() => {
    if (!canEstimatePrice || !pkg.weight.trim() || !hasValidDimensionsForEstimate) {
      setPriceEstimate(null);
      return;
    }
    const weight = parseFloat(pkg.weight);
    if (isNaN(weight) || weight < 0) return;

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
    pkg.weight,
    pkg.lengthCm,
    pkg.widthCm,
    pkg.heightCm,
    canEstimatePrice,
    hasValidDimensionsForEstimate,
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
                  value={sender.country}
                  disabled
                  className={`${clientInputClass} cursor-not-allowed opacity-90`}
                  aria-readonly="true"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sender-state" className={clientLabelClass}>
                  State
                </label>
                <select
                  id="sender-state"
                  required
                  value={sender.state}
                  onChange={(e) => setSender((s) => ({ ...s, state: e.target.value }))}
                  className={clientInputClass}
                >
                  <option value="">Select state</option>
                  {NIGERIA_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
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
                  value={recipient.country}
                  disabled
                  className={`${clientInputClass} cursor-not-allowed opacity-90`}
                  aria-readonly="true"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="recipient-state" className={clientLabelClass}>
                  State
                </label>
                <select
                  id="recipient-state"
                  required
                  value={recipient.state}
                  onChange={(e) => setRecipient((r) => ({ ...r, state: e.target.value }))}
                  className={clientInputClass}
                >
                  <option value="">Select state</option>
                  {NIGERIA_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
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
              <label htmlFor="pkg-weight" className={clientLabelClass}>
                Weight (kg)
              </label>
              <input
                id="pkg-weight"
                type="number"
                step="0.01"
                min="0"
                required
                value={pkg.weight}
                onChange={(e) => setPkg((p) => ({ ...p, weight: e.target.value }))}
                className={clientInputClass}
                placeholder="0"
              />
            </div>
            <div className="sm:col-span-2">
              <p className={clientLabelClass}>Dimensions (cm) — volume = L × W × H</p>
              <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="pkg-lengthCm" className="sr-only">
                    Length (cm)
                  </label>
                  <input
                    id="pkg-lengthCm"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={pkg.lengthCm}
                    onChange={(e) => setPkg((p) => ({ ...p, lengthCm: e.target.value }))}
                    className={clientInputClass}
                    placeholder="Length (cm)"
                    aria-label="Length in centimeters"
                  />
                </div>
                <div>
                  <label htmlFor="pkg-widthCm" className="sr-only">
                    Width (cm)
                  </label>
                  <input
                    id="pkg-widthCm"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={pkg.widthCm}
                    onChange={(e) => setPkg((p) => ({ ...p, widthCm: e.target.value }))}
                    className={clientInputClass}
                    placeholder="Width (cm)"
                    aria-label="Width in centimeters"
                  />
                </div>
                <div>
                  <label htmlFor="pkg-heightCm" className="sr-only">
                    Height (cm)
                  </label>
                  <input
                    id="pkg-heightCm"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={pkg.heightCm}
                    onChange={(e) => setPkg((p) => ({ ...p, heightCm: e.target.value }))}
                    className={clientInputClass}
                    placeholder="Height (cm)"
                    aria-label="Height in centimeters"
                  />
                </div>
              </div>
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
          description="₦1,500 base + ₦150/km + weight tier + volume tier (≤20k cm³ free; up to 80k ₦500; up to 200k ₦1,000; over 200k ₦1,500). Updates when addresses, weight, or L×W×H change."
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
            {priceEstimate !== null ? (
              <div className={`${clientInsetPanel} space-y-1.5 text-sm text-neutral-700`}>
                <p className="flex justify-between gap-4">
                  <span>Base fee</span>
                  <span className="font-medium tabular-nums">₦{priceEstimate.baseFee.toLocaleString()}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>
                    Distance ({priceEstimate.distanceKm} km
                    {priceEstimate.distanceKm < 1 ? ", under 1 km — no distance charge" : ""})
                  </span>
                  <span className="font-medium tabular-nums">₦{priceEstimate.distanceFee.toLocaleString()}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Weight tier</span>
                  <span className="font-medium tabular-nums">₦{priceEstimate.weightFee.toLocaleString()}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>
                    Size ({dimensionCategoryLabel(priceEstimate.dimensionCategory)} ·{" "}
                    {priceEstimate.volumeCm3.toLocaleString()} cm³)
                  </span>
                  <span className="font-medium tabular-nums">₦{priceEstimate.dimensionFee.toLocaleString()}</span>
                </p>
                <p className="flex justify-between gap-4 border-t border-neutral-200/80 pt-1.5 font-semibold text-neutral-900">
                  <span>Total</span>
                  <span className="tabular-nums">₦{priceEstimate.total.toLocaleString()}</span>
                </p>
              </div>
            ) : null}
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
                  onChange={() => setDeliveryType("scheduled")}
                  className="mt-1 h-4 w-4 border-neutral-300 text-[#81007f] focus:ring-[#81007f]"
                />
                <span>
                  <span className="block font-semibold text-neutral-900">Scheduled</span>
                  <span className="text-sm text-neutral-600">Choose date and 2-hour pickup window</span>
                </span>
              </label>
            </div>
          </fieldset>
          {deliveryType === "instant" && (
            <div className={`${clientInsetPanel} mt-2 space-y-4`}>
              <p className="text-sm text-neutral-600">
                Pickup coordinates (WGS84) assign the nearest rider. Example for Lagos: latitude 6.52, longitude 3.38.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pickup-lng" className={clientLabelClass}>
                    Pickup longitude
                  </label>
                  <input
                    id="pickup-lng"
                    type="number"
                    step="any"
                    required={deliveryType === "instant"}
                    value={pickupLongitude}
                    onChange={(e) => setPickupLongitude(e.target.value)}
                    className={clientInputClass}
                    placeholder="3.3792"
                  />
                </div>
                <div>
                  <label htmlFor="pickup-lat" className={clientLabelClass}>
                    Pickup latitude
                  </label>
                  <input
                    id="pickup-lat"
                    type="number"
                    step="any"
                    required={deliveryType === "instant"}
                    value={pickupLatitude}
                    onChange={(e) => setPickupLatitude(e.target.value)}
                    className={clientInputClass}
                    placeholder="6.5244"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleUsePickupLocation}
                disabled={geoLoading}
                className="text-sm font-semibold text-[#81007f] hover:underline disabled:opacity-60"
              >
                {geoLoading ? "Getting location…" : "Use my current location"}
              </button>
            </div>
          )}
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
