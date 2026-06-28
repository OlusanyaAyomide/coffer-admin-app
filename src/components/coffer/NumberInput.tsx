import { Input } from '@/components/ui/input';

type NumberInputProps = {
  /** Raw numeric string without separators, e.g. "10000" or "1500.50". */
  value: string;
  /** Receives the raw numeric string (no commas). */
  onChange: (raw: string) => void;
  allowDecimal?: boolean;
  id?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

/** Strip everything except digits (and a single dot when decimals are allowed). */
function cleanNumber(input: string, allowDecimal: boolean): string {
  const stripped = input.replace(/,/g, '');
  if (!allowDecimal) return stripped.replace(/\D/g, '');

  const digitsAndDot = stripped.replace(/[^\d.]/g, '');
  const [intPart, ...rest] = digitsAndDot.split('.');
  return rest.length ? `${intPart}.${rest.join('')}` : intPart;
}

/** Group the integer part with commas, preserving any decimal portion being typed. */
function formatWithCommas(raw: string): string {
  if (raw === '') return '';
  const [intPart, decPart] = raw.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return raw.includes('.') ? `${grouped}.${decPart ?? ''}` : grouped;
}

export default function NumberInput({
  value,
  onChange,
  allowDecimal = false,
  id,
  placeholder,
  className,
  disabled,
}: NumberInputProps) {
  return (
    <Input
      id={id}
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      value={formatWithCommas(value)}
      onChange={(e) => onChange(cleanNumber(e.target.value, allowDecimal))}
    />
  );
}
