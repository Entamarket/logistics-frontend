"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAdminClients,
  getAdminAvailableRiders,
  getAdminClientDisplayName,
  getAdminRiderDisplayName,
  createAdminShipmentsBulk,
  shortShipmentId,
  type AdminClientListItem,
  type AdminShipmentRider,
  type AdminBulkShipmentItemPayload,
  type AdminBulkShipmentResult,
} from "@/lib/admin-api";
import { NIGERIA_STATES } from "@/lib/location-data";

const MAX_ROWS = 20;
const inputClass =
  "mt-1 w-full min-h-[40px] rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:border-fuchsia-400/50 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/35";
const labelClass = "text-sm font-medium text-white/85";
const sectionLabelClass = "text-xs font-semibold uppercase tracking-wider text-fuchsia-200/55";

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

function newRowId(): string {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ShipmentRow {
  localId: string;
  deliveryType: "instant" | "scheduled";
  sender: { fullName: string; address: string; phone: string; country: string; state: string };
  recipient: { fullName: string; address: string; phone: string; country: string; state: string };
  pkg: {
    type: string;
    weight: string;
    lengthCm: string;
    widthCm: string;
    heightCm: string;
    quantity: string;
    note: string;
  };
  pickupLongitude: string;
  pickupLatitude: string;
  pickupDate: string;
  pickupWindowStart: string;
  riderIdOverride: string;
}

function emptyRow(): ShipmentRow {
  return {
    localId: newRowId(),
    deliveryType: "instant",
    sender: { fullName: "", address: "", phone: "", country: "NG", state: "" },
    recipient: { fullName: "", address: "", phone: "", country: "NG", state: "" },
    pkg: { type: "", weight: "", lengthCm: "", widthCm: "", heightCm: "", quantity: "1", note: "" },
    pickupLongitude: "",
    pickupLatitude: "",
    pickupDate: "",
    pickupWindowStart: "",
    riderIdOverride: "",
  };
}

function validateRow(row: ShipmentRow, rowNum: number): string | null {
  if (!row.sender.fullName.trim() || !row.sender.address.trim() || !row.sender.phone.trim()) {
    return `Shipment ${rowNum}: sender details are required.`;
  }
  if (!row.sender.state.trim()) {
    return `Shipment ${rowNum}: sender state is required.`;
  }
  if (!row.recipient.fullName.trim() || !row.recipient.address.trim() || !row.recipient.phone.trim()) {
    return `Shipment ${rowNum}: recipient details are required.`;
  }
  if (!row.recipient.state.trim()) {
    return `Shipment ${rowNum}: recipient state is required.`;
  }
  if (!row.pkg.type.trim()) {
    return `Shipment ${rowNum}: package type is required.`;
  }
  const weight = parseFloat(row.pkg.weight);
  const lengthCm = parseFloat(row.pkg.lengthCm);
  const widthCm = parseFloat(row.pkg.widthCm);
  const heightCm = parseFloat(row.pkg.heightCm);
  const quantity = parseInt(row.pkg.quantity, 10);
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
    return `Shipment ${rowNum}: enter valid weight, length/width/height (cm), and quantity.`;
  }
  if (row.deliveryType === "instant") {
    const lng = parseFloat(row.pickupLongitude);
    const lat = parseFloat(row.pickupLatitude);
    if (row.pickupLongitude.trim() === "" || row.pickupLatitude.trim() === "") {
      return `Shipment ${rowNum}: pickup coordinates are required for instant delivery.`;
    }
    if (Number.isNaN(lng) || Number.isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return `Shipment ${rowNum}: invalid pickup coordinates.`;
    }
  } else {
    if (!row.pickupDate.trim() || !row.pickupWindowStart.trim()) {
      return `Shipment ${rowNum}: pickup date and time are required for scheduled delivery.`;
    }
    const today = getToday();
    const maxDate = getMaxPickupDate();
    if (row.pickupDate < today) {
      return `Shipment ${rowNum}: pickup date cannot be in the past.`;
    }
    if (row.pickupDate > maxDate) {
      return `Shipment ${rowNum}: pickup date cannot be more than 7 days ahead.`;
    }
    const [year, month, day] = row.pickupDate.split("-").map(Number);
    const [hour, minute] = row.pickupWindowStart.split(":").map(Number);
    const pickupDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (pickupDateTime.getTime() < Date.now() + 60 * 60 * 1000) {
      return `Shipment ${rowNum}: pickup must be at least 1 hour from now.`;
    }
  }
  return null;
}

function rowToPayload(row: ShipmentRow): AdminBulkShipmentItemPayload {
  const weight = parseFloat(row.pkg.weight);
  const lengthCm = parseFloat(row.pkg.lengthCm);
  const widthCm = parseFloat(row.pkg.widthCm);
  const heightCm = parseFloat(row.pkg.heightCm);
  const quantity = parseInt(row.pkg.quantity, 10);
  const payload: AdminBulkShipmentItemPayload = {
    deliveryType: row.deliveryType,
    senderDetails: {
      fullName: row.sender.fullName.trim(),
      address: row.sender.address.trim(),
      phone: row.sender.phone.trim(),
      country: row.sender.country || "NG",
      state: row.sender.state.trim(),
    },
    recipientDetails: {
      fullName: row.recipient.fullName.trim(),
      address: row.recipient.address.trim(),
      phone: row.recipient.phone.trim(),
      country: row.recipient.country || "NG",
      state: row.recipient.state.trim(),
    },
    packageDetails: {
      type: row.pkg.type.trim(),
      weight,
      lengthCm,
      widthCm,
      heightCm,
      quantity,
      note: row.pkg.note.trim() || undefined,
    },
  };
  if (row.deliveryType === "instant") {
    payload.pickupLongitude = parseFloat(row.pickupLongitude);
    payload.pickupLatitude = parseFloat(row.pickupLatitude);
  } else {
    const [y, m, d] = row.pickupDate.split("-").map(Number);
    const [h, min] = row.pickupWindowStart.split(":").map(Number);
    const start = new Date(y, m - 1, d, h, min, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    payload.pickupWindowStart = start.toISOString();
    payload.pickupWindowEnd = end.toISOString();
  }
  if (row.riderIdOverride.trim()) {
    payload.riderId = row.riderIdOverride.trim();
  }
  return payload;
}

interface AdminBulkShipmentCreateProps {
  onViewList?: () => void;
}

export function AdminBulkShipmentCreate({ onViewList }: AdminBulkShipmentCreateProps) {
  const [clients, setClients] = useState<AdminClientListItem[]>([]);
  const [riders, setRiders] = useState<AdminShipmentRider[]>([]);
  const [clientId, setClientId] = useState("");
  const [defaultRiderId, setDefaultRiderId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [rows, setRows] = useState<ShipmentRow[]>([emptyRow()]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<AdminBulkShipmentResult[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [clientsRes, ridersRes] = await Promise.all([
        getAdminClients({ limit: 200 }),
        getAdminAvailableRiders(),
      ]);
      if (cancelled) return;
      setLoadingMeta(false);
      if (clientsRes.success && clientsRes.data) {
        const active = clientsRes.data.filter((c) => c.status === "active");
        setClients(active);
        if (active.length > 0) setClientId(active[0].id);
      }
      if (ridersRes.success && ridersRes.data) {
        setRiders(ridersRes.data);
        if (ridersRes.data.length > 0) setDefaultRiderId(ridersRes.data[0].riderId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredClients = clientSearch.trim()
    ? clients.filter((c) => {
        const q = clientSearch.toLowerCase();
        const name = getAdminClientDisplayName(c).toLowerCase();
        return name.includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
      })
    : clients;

  function updateRow(localId: string, patch: Partial<ShipmentRow>) {
    setRows((prev) => prev.map((r) => (r.localId === localId ? { ...r, ...patch } : r)));
  }

  function addRow() {
    if (rows.length >= MAX_ROWS) return;
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(localId: string) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.localId !== localId)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResults(null);
    if (!clientId) {
      setError("Please select a client.");
      return;
    }
    if (!defaultRiderId) {
      setError("Please select a default rider.");
      return;
    }
    for (let i = 0; i < rows.length; i++) {
      const err = validateRow(rows[i], i + 1);
      if (err) {
        setError(err);
        return;
      }
    }
    setSubmitting(true);
    const res = await createAdminShipmentsBulk({
      clientId,
      defaultRiderId,
      shipments: rows.map(rowToPayload),
    });
    setSubmitting(false);
    if (res.success && res.data) {
      setResults(res.data.results);
      return;
    }
    setError(res.message || "Failed to create shipments");
  }

  function handleReset() {
    setRows([emptyRow()]);
    setResults(null);
    setError("");
  }

  if (loadingMeta) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        role="status"
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400/30 border-t-fuchsia-300" />
        Loading clients and riders…
      </div>
    );
  }

  const succeeded = results?.filter((r) => r.success).length ?? 0;
  const failed = results?.filter((r) => !r.success).length ?? 0;

  return (
    <div className="max-w-4xl space-y-6">
      <p className="text-sm leading-relaxed text-white/55">
        Create multiple shipments for one client and assign riders. Use a default rider for all rows, or override per
        shipment.
      </p>

      {results && (
        <div className="space-y-3 rounded-2xl border border-emerald-400/25 bg-emerald-950/20 p-4 shadow-[0_0_28px_rgba(52,211,153,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <p className="text-sm font-semibold text-white/95">
            {succeeded} created and assigned
            {failed > 0 ? `, ${failed} failed` : ""}.
          </p>
          <ul className="space-y-2 text-sm">
            {results.map((r) => (
              <li
                key={r.index}
                className={r.success ? "text-emerald-200/95" : "text-red-200/95"}
              >
                Shipment {r.index + 1}:{" "}
                {r.success && r.shipmentId ? (
                  <Link
                    href={`/admin/shipments/${r.shipmentId}`}
                    className="font-semibold text-fuchsia-200 underline decoration-fuchsia-400/50 underline-offset-2 hover:text-fuchsia-100"
                  >
                    #{shortShipmentId(r.shipmentId)}
                  </Link>
                ) : (
                  r.error || "Unknown error"
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] rounded-lg border border-fuchsia-400/35 bg-fuchsia-500/10 px-3 text-sm font-semibold text-fuchsia-100 shadow-[0_0_16px_rgba(232,121,249,0.15)] transition hover:bg-fuchsia-500/20"
            >
              Create another batch
            </button>
            {onViewList && (
              <button
                type="button"
                onClick={onViewList}
                className="min-h-[44px] rounded-lg border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                View all shipments
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>Search client</span>
            <input
              type="search"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Filter by name, email, phone…"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Client</span>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select client…</option>
              {filteredClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {getAdminClientDisplayName(c)} ({c.email})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Default rider</span>
            <select
              value={defaultRiderId}
              onChange={(e) => setDefaultRiderId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select rider…</option>
              {riders.map((r) => (
                <option key={r.riderId} value={r.riderId}>
                  {getAdminRiderDisplayName(r)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {rows.map((row, index) => (
          <fieldset
            key={row.localId}
            className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_32px_-12px_rgba(129,0,127,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <div className="flex items-center justify-between gap-2">
              <legend className="text-sm font-bold text-fuchsia-200 drop-shadow-[0_0_12px_rgba(232,121,249,0.35)]">
                Shipment {index + 1}
              </legend>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.localId)}
                  className="text-xs font-semibold text-red-300/90 hover:text-red-200 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className={labelClass}>Delivery type</span>
                <select
                  value={row.deliveryType}
                  onChange={(e) =>
                    updateRow(row.localId, { deliveryType: e.target.value as "instant" | "scheduled" })
                  }
                  className={inputClass}
                >
                  <option value="instant">Instant</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>
                  Rider override <span className="font-normal text-white/45">(optional)</span>
                </span>
                <select
                  value={row.riderIdOverride}
                  onChange={(e) => updateRow(row.localId, { riderIdOverride: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Use default rider</option>
                  {riders.map((r) => (
                    <option key={r.riderId} value={r.riderId}>
                      {getAdminRiderDisplayName(r)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <p className={`sm:col-span-3 ${sectionLabelClass}`}>Sender</p>
              <input
                placeholder="Full name"
                value={row.sender.fullName}
                onChange={(e) =>
                  updateRow(row.localId, { sender: { ...row.sender, fullName: e.target.value } })
                }
                required
                className={inputClass}
              />
              <select
                value={row.sender.state}
                onChange={(e) =>
                  updateRow(row.localId, { sender: { ...row.sender, state: e.target.value } })
                }
                required
                className={inputClass}
                aria-label="Sender state"
              >
                <option value="">State</option>
                {NIGERIA_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <input
                placeholder="Phone"
                value={row.sender.phone}
                onChange={(e) =>
                  updateRow(row.localId, { sender: { ...row.sender, phone: e.target.value } })
                }
                required
                className={inputClass}
              />
              <input
                placeholder="Address (street, area)"
                value={row.sender.address}
                onChange={(e) =>
                  updateRow(row.localId, { sender: { ...row.sender, address: e.target.value } })
                }
                required
                className={`${inputClass} sm:col-span-3`}
              />
              <p className={`sm:col-span-3 text-xs text-white/40`}>Country: Nigeria (NG)</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <p className={`sm:col-span-3 ${sectionLabelClass}`}>Recipient</p>
              <input
                placeholder="Full name"
                value={row.recipient.fullName}
                onChange={(e) =>
                  updateRow(row.localId, { recipient: { ...row.recipient, fullName: e.target.value } })
                }
                required
                className={inputClass}
              />
              <select
                value={row.recipient.state}
                onChange={(e) =>
                  updateRow(row.localId, { recipient: { ...row.recipient, state: e.target.value } })
                }
                required
                className={inputClass}
                aria-label="Recipient state"
              >
                <option value="">State</option>
                {NIGERIA_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <input
                placeholder="Phone"
                value={row.recipient.phone}
                onChange={(e) =>
                  updateRow(row.localId, { recipient: { ...row.recipient, phone: e.target.value } })
                }
                required
                className={inputClass}
              />
              <input
                placeholder="Address (street, area)"
                value={row.recipient.address}
                onChange={(e) =>
                  updateRow(row.localId, { recipient: { ...row.recipient, address: e.target.value } })
                }
                required
                className={`${inputClass} sm:col-span-3`}
              />
              <p className={`sm:col-span-3 text-xs text-white/40`}>Country: Nigeria (NG)</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <p className={`col-span-full ${sectionLabelClass}`}>Package</p>
              <input
                placeholder="Type"
                value={row.pkg.type}
                onChange={(e) => updateRow(row.localId, { pkg: { ...row.pkg, type: e.target.value } })}
                required
                className={inputClass}
              />
              <input
                placeholder="Weight (kg)"
                type="number"
                min={0}
                step="0.1"
                value={row.pkg.weight}
                onChange={(e) => updateRow(row.localId, { pkg: { ...row.pkg, weight: e.target.value } })}
                required
                className={inputClass}
              />
              <input
                placeholder="L (cm)"
                type="number"
                min={0}
                value={row.pkg.lengthCm}
                onChange={(e) => updateRow(row.localId, { pkg: { ...row.pkg, lengthCm: e.target.value } })}
                required
                className={inputClass}
              />
              <input
                placeholder="W (cm)"
                type="number"
                min={0}
                value={row.pkg.widthCm}
                onChange={(e) => updateRow(row.localId, { pkg: { ...row.pkg, widthCm: e.target.value } })}
                required
                className={inputClass}
              />
              <input
                placeholder="H (cm)"
                type="number"
                min={0}
                value={row.pkg.heightCm}
                onChange={(e) => updateRow(row.localId, { pkg: { ...row.pkg, heightCm: e.target.value } })}
                required
                className={inputClass}
              />
              <input
                placeholder="Qty"
                type="number"
                min={1}
                value={row.pkg.quantity}
                onChange={(e) => updateRow(row.localId, { pkg: { ...row.pkg, quantity: e.target.value } })}
                required
                className={inputClass}
              />
              <input
                placeholder="Note (optional)"
                value={row.pkg.note}
                onChange={(e) => updateRow(row.localId, { pkg: { ...row.pkg, note: e.target.value } })}
                className={`${inputClass} col-span-full`}
              />
            </div>

            {row.deliveryType === "instant" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelClass}>Pickup longitude</span>
                  <input
                    type="text"
                    value={row.pickupLongitude}
                    onChange={(e) => updateRow(row.localId, { pickupLongitude: e.target.value })}
                    required
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Pickup latitude</span>
                  <input
                    type="text"
                    value={row.pickupLatitude}
                    onChange={(e) => updateRow(row.localId, { pickupLatitude: e.target.value })}
                    required
                    className={inputClass}
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelClass}>Pickup date</span>
                  <input
                    type="date"
                    min={getToday()}
                    max={getMaxPickupDate()}
                    value={row.pickupDate}
                    onChange={(e) => updateRow(row.localId, { pickupDate: e.target.value })}
                    required
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Pickup time</span>
                  <input
                    type="time"
                    value={row.pickupWindowStart}
                    onChange={(e) => updateRow(row.localId, { pickupWindowStart: e.target.value })}
                    required
                    className={inputClass}
                  />
                </label>
              </div>
            )}
          </fieldset>
        ))}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= MAX_ROWS}
            className="min-h-[44px] rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 text-sm font-semibold text-fuchsia-100 shadow-[0_0_18px_rgba(232,121,249,0.15)] transition hover:bg-fuchsia-500/20 disabled:opacity-45"
          >
            Add shipment ({rows.length}/{MAX_ROWS})
          </button>
        </div>

        {error && (
          <div
            className="rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100 shadow-[0_0_28px_rgba(248,113,113,0.2)]"
            role="alert"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || clients.length === 0 || riders.length === 0}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#81007f] to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-[0_0_28px_rgba(129,0,127,0.45),0_12px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/15 transition hover:shadow-[0_0_40px_rgba(217,70,239,0.55)] disabled:opacity-55"
        >
          {submitting ? "Creating…" : `Create ${rows.length} shipment${rows.length > 1 ? "s" : ""} & assign`}
        </button>

        {(clients.length === 0 || riders.length === 0) && (
          <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.12)]">
            {clients.length === 0 && "No active clients available. "}
            {riders.length === 0 && "No available riders for assignment."}
          </p>
        )}
      </form>
    </div>
  );
}
