import type { ChangeEvent } from 'react';
import type { SortField, SortDir } from '@/features/instruments/api/types';

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
      <option value="symbol:asc">Symbol A→Z</option>
      <option value="symbol:desc">Symbol Z→A</option>
      <option value="changePct24h:desc">24h % High→Low</option>
      <option value="changePct24h:asc">24h % Low→High</option>
      <option value="volume:desc">Volume High→Low</option>
    </select>
  );
}
