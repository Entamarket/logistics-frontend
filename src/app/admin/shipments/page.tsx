"use client";

import { useState } from "react";
import { AdminShipmentsList } from "@/components/admin/AdminShipmentsList";
import { AdminBulkShipmentCreate } from "@/components/admin/AdminBulkShipmentCreate";

type ShipmentsTab = "list" | "create";

export default function AdminShipmentsPage() {
  const [activeTab, setActiveTab] = useState<ShipmentsTab>("list");

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-fuchsia-500/25 bg-gradient-to-br from-slate-950 via-[#1a0a24] to-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_80px_-20px_rgba(192,38,211,0.55),0_32px_64px_-24px_rgba(0,0,0,0.65)]">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-fuchsia-600/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-violet-600/20 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(129,0,127,0.12)_0%,transparent_55%)]"
        aria-hidden
      />

      <div className="relative space-y-8 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-fuchsia-200/90 shadow-[0_0_20px_rgba(232,121,249,0.25)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_8px_#f0abfc]" />
              </span>
              Operations
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(232,121,249,0.45)]">
                Shipments
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/55">
              Track every job, filter by pipeline stage, or batch-create and assign riders from one neon console.
            </p>
          </div>

          <div
            className="flex w-full rounded-xl border border-white/10 bg-white/[0.04] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_28px_-8px_rgba(129,0,127,0.35)] backdrop-blur-sm sm:w-auto"
            role="tablist"
            aria-label="Shipments views"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "list"}
              onClick={() => setActiveTab("list")}
              className={`min-h-[48px] flex-1 rounded-lg px-4 text-sm font-semibold transition sm:flex-none ${
                activeTab === "list"
                  ? "bg-gradient-to-r from-[#81007f]/90 to-fuchsia-600/90 text-white shadow-[0_0_24px_rgba(129,0,127,0.45)] ring-1 ring-white/20"
                  : "text-white/55 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              All shipments
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "create"}
              onClick={() => setActiveTab("create")}
              className={`min-h-[48px] flex-1 rounded-lg px-4 text-sm font-semibold transition sm:flex-none ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-[#81007f]/90 to-fuchsia-600/90 text-white shadow-[0_0_24px_rgba(129,0,127,0.45)] ring-1 ring-white/20"
                  : "text-white/55 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              Create & assign
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === "list" ? (
            <AdminShipmentsList />
          ) : (
            <AdminBulkShipmentCreate onViewList={() => setActiveTab("list")} />
          )}
        </div>
      </div>
    </div>
  );
}
