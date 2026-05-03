import type { ChangeEvent } from 'react';

interface InstrumentsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function InstrumentsSearch({ value, onChange }: InstrumentsSearchProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

  return (
    <input
      type="search"
      placeholder="Search symbol…"
      value={value}
      onChange={handleChange}
      className="h-8 w-56 rounded-md border border-border-default bg-surface-800 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-400"
      aria-label="Search instruments"
    />
  );
}
