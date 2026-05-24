export const DEFAULT_COUNTRY_CODE = "NG";

export const COUNTRY_OPTIONS = [{ code: "NG", label: "Nigeria" }] as const;

/** Nigerian states and the Federal Capital Territory (36 + FCT). */
export const NIGERIA_STATES: readonly string[] = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export function countryLabel(code: string | undefined): string {
  if (!code) return "";
  const found = COUNTRY_OPTIONS.find((c) => c.code === code.toUpperCase());
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
