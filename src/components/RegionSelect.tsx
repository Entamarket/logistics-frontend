import { getStatesForCountry, hasStatesForCountry } from "@/lib/location-data";

interface RegionSelectProps {
  id: string;
  countryCode: string;
  value: string;
  onChange: (value: string) => void;
  labelClassName?: string;
  inputClassName: string;
  required?: boolean;
  hideLabel?: boolean;
  ariaLabel?: string;
}

export function RegionSelect({
  id,
  countryCode,
  value,
  onChange,
  labelClassName,
  inputClassName,
  required = true,
  hideLabel = false,
  ariaLabel,
}: RegionSelectProps) {
  const states = getStatesForCountry(countryCode);
  const hasStates = hasStatesForCountry(countryCode);
  const resolvedAriaLabel = ariaLabel ?? (hasStates ? "State or province" : "State or region");

  return (
    <div>
      {!hideLabel ? (
        <label htmlFor={id} className={labelClassName}>
          {hasStates ? "State / province" : "State / region"}
        </label>
      ) : null}
      {hasStates ? (
        <select
          id={id}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          aria-label={hideLabel ? resolvedAriaLabel : undefined}
        >
          <option value="">Select state / province</option>
          {states.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          placeholder="State, province, or region"
          aria-label={hideLabel ? resolvedAriaLabel : undefined}
        />
      )}
    </div>
  );
}
