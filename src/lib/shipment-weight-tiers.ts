export type WeightTierId = "upTo5" | "over5to10" | "over10to20" | "over20";

export interface WeightTierOption {
  id: WeightTierId;
  label: string;
  /** Numeric weight sent to the API for pricing (upper bound of the tier). */
  pricingWeightKg: number;
}

export const WEIGHT_TIER_OPTIONS: WeightTierOption[] = [
  { id: "upTo5", label: "0 kg to 5 kg", pricingWeightKg: 5 },
  { id: "over5to10", label: "Over 5 kg to 10 kg", pricingWeightKg: 10 },
  { id: "over10to20", label: "Over 10 kg to 20 kg", pricingWeightKg: 20 },
  { id: "over20", label: "Over 20 kg", pricingWeightKg: 21 },
];

const TIER_BY_ID = new Map(WEIGHT_TIER_OPTIONS.map((t) => [t.id, t]));

export function weightKgFromTierId(id: string): number | null {
  const tier = TIER_BY_ID.get(id as WeightTierId);
  return tier ? tier.pricingWeightKg : null;
}

/** Maps any stored kg value to its pricing tier label (matches backend weightFeeNgn bands). */
export function formatWeightRangeLabel(weightKg: number): string {
  if (!Number.isFinite(weightKg) || weightKg < 0) return "Unknown weight";
  if (weightKg <= 5) return WEIGHT_TIER_OPTIONS[0].label;
  if (weightKg <= 10) return WEIGHT_TIER_OPTIONS[1].label;
  if (weightKg <= 20) return WEIGHT_TIER_OPTIONS[2].label;
  return WEIGHT_TIER_OPTIONS[3].label;
}
