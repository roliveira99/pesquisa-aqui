import { PLATFORM_CITIES } from "@/lib/cities";

interface CitySelectFieldProps {
  value: string;
  onChange: (city: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  allowEmpty?: boolean;
}

export function CitySelectField({
  value,
  onChange,
  required = false,
  className = "input-field",
  placeholder = "Selecione a cidade",
  allowEmpty = false,
}: CitySelectFieldProps) {
  return (
    <select
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {allowEmpty && <option value="">{placeholder}</option>}
      {!allowEmpty && !value && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {PLATFORM_CITIES.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </select>
  );
}
