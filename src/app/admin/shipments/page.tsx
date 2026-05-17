"use client";

import { useState } from "react";
import { AdminShipmentsList } from "@/components/admin/AdminShipmentsList";
import { AdminBulkShipmentCreate } from "@/components/admin/AdminBulkShipmentCreate";

type ShipmentsTab = "list" | "create";

export default function AdminShipmentsPage() {
  const [activeTab, setActiveTab] = useState<ShipmentsTab>("list");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#81007f]">Shipments</h1>
        <div className="flex rounded-lg border border-neutral-200 p-1 bg-neutral-50 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`flex-1 sm:flex-none min-h-[44px] px-4 rounded-md text-sm font-medium transition ${
              activeTab === "list"
                ? "bg-white text-[#81007f] shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            All shipments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex-1 sm:flex-none min-h-[44px] px-4 rounded-md text-sm font-medium transition ${
              activeTab === "create"
                ? "bg-white text-[#81007f] shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Create & assign
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        <AdminShipmentsList />
      ) : (
        <AdminBulkShipmentCreate onViewList={() => setActiveTab("list")} />
      )}
    </div>
  );
}
