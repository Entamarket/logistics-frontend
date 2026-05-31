import countryOptionsJson from "./country-options.generated.json";
import countryStatesJson from "./country-states.generated.json";

export const DEFAULT_COUNTRY_CODE = "NG";

export type CountryOption = { code: string; label: string };

/** ISO 3166-1 alpha-2 countries, sorted by label. */
export const COUNTRY_OPTIONS: CountryOption[] = countryOptionsJson as CountryOption[];

/** State/province names keyed by ISO country code (subset of countries with known subdivisions). */
const COUNTRY_STATES: Record<string, string[]> = countryStatesJson as Record<string, string[]>;

export function normalizeCountryCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isNigeriaCountry(code: string): boolean {
  return normalizeCountryCode(code) === DEFAULT_COUNTRY_CODE;
}

/** Returns sorted state/province names for a country, or an empty array if none are catalogued. */
export function getStatesForCountry(countryCode: string): readonly string[] {
  const code = normalizeCountryCode(countryCode);
  return COUNTRY_STATES[code] ?? [];
}

export function hasStatesForCountry(countryCode: string): boolean {
  return getStatesForCountry(countryCode).length > 0;
}

/** @deprecated Prefer getStatesForCountry("NG") — kept for backward compatibility. */
export const NIGERIA_STATES: readonly string[] = getStatesForCountry(DEFAULT_COUNTRY_CODE);

export function countryLabel(code: string | undefined): string {
  if (!code) return "";
  const normalized = normalizeCountryCode(code);
  const found = COUNTRY_OPTIONS.find((c) => c.code === normalized);
  return found?.label ?? code;
}

export function formatContactLocation(parts: {
  address: string;
  state?: string;
  country?: string;
}): string {
  const segments = [parts.address.trim()];
  if (parts.state?.trim()) segments.push(parts.state.trim());
  const country = parts.country?.trim();
  if (country) {
    const label = countryLabel(country);
    if (label) segments.push(label);
  }
  return segments.filter(Boolean).join(", ");
}

/** Full address string for geocoding (matches backend formatContactAddress). */
export function formatContactAddress(parts: {
  address: string;
  state?: string;
  country?: string;
}): string {
  const address = parts.address.trim();
  const state = parts.state?.trim() ?? "";
  const countryCode = parts.country?.trim() || DEFAULT_COUNTRY_CODE;
  const countryName = countryLabel(countryCode) || countryCode;
  return [address, state, countryName].filter(Boolean).join(", ");
}
