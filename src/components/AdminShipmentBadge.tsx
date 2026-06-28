type AdminShipmentBadgeProps = {
  /** Visual theme for admin dashboard (dark) vs rider dashboard (light). */
  theme?: "admin" | "rider";
  className?: string;
};

export function AdminShipmentBadge({ theme = "rider", className = "" }: AdminShipmentBadgeProps) {
  const base =
    theme === "admin"
      ? "inline-flex items-center rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.2)]"
      : "inline-flex items-center rounded-full border border-[#81007f]/25 bg-[#81007f]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6a0068] shadow-[0_0_12px_rgba(129,0,127,0.15)]";

  return (
    <span className={`${base} ${className}`.trim()} title="Created by admin account">
      Admin account
    </span>
  );
}

export function isPlaceholderContactValue(value: string | undefined | null): boolean {
  const v = value?.trim();
  return !v || v === "—" || v === "-";
}
