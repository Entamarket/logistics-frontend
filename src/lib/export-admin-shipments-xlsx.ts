import * as XLSX from "xlsx";
import type { AdminShipmentExportItem, AdminShipmentExportResult } from "./admin-api";
import {
  formatAdminDate,
  getAdminRiderDisplayName,
  getAdminShipmentClientLabel,
  getAdminShipmentClientEmail,
  shortShipmentId,
} from "./admin-api";

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

function formatOptionalDate(iso?: string): string {
  if (!iso) return "—";
  return formatAdminDate(iso);
}

function formatContactLocation(
  details: { state?: string; country?: string }
): string {
  const parts = [details.state, details.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

function shipmentDataRows(shipments: AdminShipmentExportItem[]): (string | number)[][] {
  return shipments.map((s) => {
    const pkg = s.packageDetails;
    const dims = `${pkg.lengthCm}×${pkg.widthCm}×${pkg.heightCm} cm`;
    return [
      shortShipmentId(s.id),
      s.id,
      s.status.replace(/_/g, " "),
      s.deliveryType,
      s.assignmentLabel,
      formatAdminDate(s.createdAt),
      formatOptionalDate(s.updatedAt),
      formatOptionalDate(s.deliveredAt),
      s.price,
      formatCurrency(s.price),
      s.paymentStatus,
      formatOptionalDate(s.paidAt),
      s.paystackReference ?? "—",
      getAdminShipmentClientLabel(s.client),
      getAdminShipmentClientEmail(s.client),
      s.client?.phone?.trim() ? s.client.phone : "—",
      s.rider ? getAdminRiderDisplayName(s.rider) : "—",
      s.rider?.email ?? "—",
      s.rider?.phone ?? "—",
      s.senderDetails.fullName,
      s.senderDetails.phone,
      s.senderDetails.address,
      formatContactLocation(s.senderDetails),
      s.recipientDetails.fullName,
      s.recipientDetails.phone,
      s.recipientDetails.address,
      formatContactLocation(s.recipientDetails),
      pkg.type,
      pkg.weight,
      dims,
      pkg.quantity,
      pkg.note?.trim() || "—",
      formatOptionalDate(s.pickupWindowStart),
      formatOptionalDate(s.pickupWindowEnd),
    ];
  });
}

const SHIPMENT_HEADER = [
  "Ref",
  "Shipment ID",
  "Status",
  "Delivery type",
  "Assignment",
  "Created",
  "Updated",
  "Delivered",
  "Price (NGN)",
  "Price (formatted)",
  "Payment status",
  "Paid at",
  "Paystack reference",
  "Client name",
  "Client email",
  "Client phone",
  "Rider name",
  "Rider email",
  "Rider phone",
  "Sender name",
  "Sender phone",
  "Sender address",
  "Sender state/country",
  "Recipient name",
  "Recipient phone",
  "Recipient address",
  "Recipient state/country",
  "Package type",
  "Weight (kg)",
  "Dimensions (L×W×H)",
  "Quantity",
  "Package note",
  "Pickup window start",
  "Pickup window end",
];

/**
 * Download an Excel workbook of admin shipment export data (matches financial report pattern).
 */
export function exportAdminShipmentsXlsx(result: AdminShipmentExportResult): void {
  const { shipments, label, year, month } = result;
  const periodLabel = month != null ? label : `Full year ${year}`;
  const totalRevenue = shipments.reduce((sum, s) => sum + (s.price || 0), 0);
  const paidCount = shipments.filter((s) => s.paymentStatus === "paid").length;
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length;

  const dataSheet = XLSX.utils.aoa_to_sheet([
    [`Shipments export — ${periodLabel}`],
    ["Shipments are filtered by created date within the selected period."],
    [],
    SHIPMENT_HEADER,
    ...shipmentDataRows(shipments),
    [],
    ["Total rows", shipments.length],
    ["Total price (all rows)", formatCurrency(totalRevenue)],
  ]);

  const summaryRows: (string | number)[][] = [
    ["Shipment Export Summary"],
    [],
    ["Period", periodLabel],
    ["Year", year],
    ["Month", month != null ? label : "All months"],
    ["Generated at", formatAdminDate(result.generatedAt)],
    ["Shipment count", result.count],
    ["Delivered", deliveredCount],
    ["Paid", paidCount],
    ["Total price (NGN)", totalRevenue],
    ["Total price (formatted)", formatCurrency(totalRevenue)],
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, dataSheet, "Shipments");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), "Summary");

  const slug = month != null ? `${year}-${String(month).padStart(2, "0")}` : String(year);
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `admin-shipments-${slug}-${date}.xlsx`);
}
