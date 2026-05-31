import type { DimensionCategory } from "@/lib/shipment-api";
import { dimensionCategoryLabel } from "@/lib/shipment-api";

export const VOLUME_SMALL_MAX_CM3 = 20_000;
export const VOLUME_MEDIUM_MAX_CM3 = 80_000;
export const VOLUME_LARGE_MAX_CM3 = 200_000;

export interface PackageSizeOption {
  id: DimensionCategory;
  label: string;
  /** Label shown in the create-shipment dropdown (includes examples). */
  dropdownLabel: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export const PACKAGE_SIZE_OPTIONS: PackageSizeOption[] = [
  {
    id: "small",
    label: "Small",
    dropdownLabel: "Small (e.g phone, documents)",
    lengthCm: 20,
    widthCm: 20,
    heightCm: 50,
  },
  {
    id: "medium",
    label: "Medium",
    dropdownLabel: "Medium (e.g laptop, bag pack)",
    lengthCm: 40,
    widthCm: 40,
    heightCm: 50,
  },
  {
    id: "large",
    label: "Large",
    dropdownLabel: "Large (e.g office chair, large TV screen)",
    lengthCm: 50,
    widthCm: 50,
    heightCm: 80,
  },
  {
    id: "extraLarge",
    label: "Extra large",
    dropdownLabel: "Extra large (e.g mattress, sofa)",
    lengthCm: 50,
    widthCm: 50,
    heightCm: 81,
  },
];

const TIER_BY_ID = new Map(PACKAGE_SIZE_OPTIONS.map((t) => [t.id, t]));

export function dimensionsFromSizeTierId(
  id: string
): { lengthCm: number; widthCm: number; heightCm: number } | null {
  const tier = TIER_BY_ID.get(id as DimensionCategory);
  if (!tier) return null;
  return { lengthCm: tier.lengthCm, widthCm: tier.widthCm, heightCm: tier.heightCm };
}

export function volumeCm3(lengthCm: number, widthCm: number, heightCm: number): number {
  if (!Number.isFinite(lengthCm) || !Number.isFinite(widthCm) || !Number.isFinite(heightCm)) return 0;
  if (lengthCm < 0 || widthCm < 0 || heightCm < 0) return 0;
  return lengthCm * widthCm * heightCm;
}

function dimensionCategoryFromVolume(vol: number): DimensionCategory {
  if (!Number.isFinite(vol) || vol <= VOLUME_SMALL_MAX_CM3) return "small";
  if (vol <= VOLUME_MEDIUM_MAX_CM3) return "medium";
  if (vol <= VOLUME_LARGE_MAX_CM3) return "large";
  return "extraLarge";
}

/** Maps stored L×W×H to package size label (matches backend volume tier bands). */
export function formatPackageSizeLabel(
  lengthCm: number,
  widthCm: number,
  heightCm: number
): string {
  const vol = volumeCm3(lengthCm, widthCm, heightCm);
  if (vol <= 0 && (!Number.isFinite(lengthCm) || !Number.isFinite(widthCm) || !Number.isFinite(heightCm))) {
    return "Unknown size";
  }
  return dimensionCategoryLabel(dimensionCategoryFromVolume(vol));
}
