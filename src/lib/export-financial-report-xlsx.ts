import * as XLSX from "xlsx";
import type { FinancialReports, MonthlyFinancialReport } from "./admin-api";

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

function formatPct(pct: number | null): string {
  if (pct === null) return "—";
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

function resolveReportYear(report: FinancialReports): number {
  if (report.year != null) return report.year;
  if (report.monthly.length > 0) {
    return parseInt(report.monthly[0].yearMonth.slice(0, 4), 10);
  }
  return new Date().getFullYear();
}

/** Same row order and cell values as the on-screen Monthly report ledger (Jan–Dec). */
function ledgerRowsChronological(monthly: MonthlyFinancialReport[]): (string | number)[][] {
  return monthly.map((m) => [
    m.label,
    m.deliveredCount,
    formatCurrency(m.revenue),
    m.deliveredCount > 0 ? formatCurrency(m.averageOrderValue) : "—",
    formatPct(m.changeFromPreviousPct),
  ]);
}

/**
 * Download an Excel workbook for the chosen year: monthly ledger (matches UI) plus summary.
 */
export function exportFinancialReportXlsx(report: FinancialReports): void {
  const year = resolveReportYear(report);

  const ledgerHeader = ["Month", "Delivered", "Revenue", "Avg order", "vs prev month"];

  const ledgerTitle = [`Monthly report ledger — ${year}`];
  const ledgerNote = [
    "January through December. Revenue is the sum of shipment prices completed in that month.",
  ];

  const monthlyRows = ledgerRowsChronological(report.monthly);

  const ledgerTotal: (string | number)[][] = [
    [],
    ["Year total", report.periodTotalDelivered, formatCurrency(report.periodTotalRevenue), "", ""],
  ];

  const ledgerSheet = XLSX.utils.aoa_to_sheet([
    ledgerTitle,
    ledgerNote,
    [],
    ledgerHeader,
    ...monthlyRows,
    ...ledgerTotal,
  ]);

  const summaryRows: (string | number)[][] = [
    ["Financial Report Summary"],
    [],
    ["Year", year],
    ["Generated at", report.generatedAt],
    ["Currency", report.currency],
    ["Year revenue", formatCurrency(report.periodTotalRevenue)],
    ["Year deliveries", report.periodTotalDelivered],
    ["Avg monthly revenue", formatCurrency(report.periodAverageMonthlyRevenue)],
    [],
    ["All-time revenue", formatCurrency(report.allTimeRevenue)],
    ["All-time deliveries", report.allTimeDeliveredCount],
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ledgerSheet, "Monthly report ledger");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), "Summary");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `financial-report-${year}-${date}.xlsx`);
}
