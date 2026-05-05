import type { ChangeEvent } from 'react';
import type { SortField, SortDir } from '@/features/instruments/api/types';

const SORT_OPTIONS = [
  { value: 'symbol:asc', label: 'Symbol A→Z' },
  { value: 'symbol:desc', label: 'Symbol Z→A' },
  { value: 'changePct24h:desc', label: '24h % High→Low' },
  { value: 'changePct24h:asc', label: '24h % Low→High' },
  { value: 'volume:desc', label: 'Volume High→Low' },
  { value: 'volume:asc', label: 'Volume Low→High' },
] as const;

interface InstrumentsSortProps {
  sortField: SortField;
  sortDir: SortDir;
  onChange: (field: string, dir: string) => void;
}

export function InstrumentsSort({ sortField, sortDir, onChange }: InstrumentsSortProps) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const [field, dir] = e.target.value.split(':');
    onChange(field, dir);
  };

  return (
    <select
      value={`${sortField}:${sortDir}`}
      onChange={handleChange}
      className="h-8 rounded-md border border-border-default bg-surface-800 px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
      aria-label="Sort by"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
