import { flexRender, type Table } from '@tanstack/react-table';
import type { Instrument } from '@/features/instruments/api/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface InstrumentsTableProps {
  table: Table<Instrument>;
  onInspect: (symbol: string) => void;
}

export function InstrumentsTable({ table, onInspect }: InstrumentsTableProps) {
  return (
    <table className="w-full text-md" role="grid">
      <thead className="border-b border-border-default bg-surface-900">
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th
                key={h.id}
                className="px-4 py-3 text-left font-medium text-text-secondary"
                aria-sort={
                  h.column.getIsSorted() === 'asc'
                    ? 'ascending'
                    : h.column.getIsSorted() === 'desc'
                      ? 'descending'
                      : undefined
                }
              >
                {h.column.getCanSort() ? (
                  <button
                    className="flex items-center gap-1 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    <span className="text-xs opacity-50">
                      {h.column.getIsSorted() === 'asc'
                        ? '↑'
                        : h.column.getIsSorted() === 'desc'
                          ? '↓'
                          : '↕'}
                    </span>
                  </button>
                ) : (
                  flexRender(h.column.columnDef.header, h.getContext())
                )}
              </th>
            ))}
            <th className="px-6 py-3 text-left font-medium text-text-secondary">[Inspect]</th>
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.length === 0 ? (
          <tr>
            <td colSpan={7}>
              <EmptyState message="No instruments match your search." />
            </td>
          </tr>
        ) : (
          table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border-subtle last:border-0 hover:bg-surface-800"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-text-primary">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              <td className="px-4 py-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onInspect(row.original.symbol)}
                  className="cursor-pointer text-gray-200"
                >
                  Inspect →
                </Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
