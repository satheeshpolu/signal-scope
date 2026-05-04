import { type Table } from '@tanstack/react-table';
import type { Instrument } from '@/features/instruments/api/types';
import { Button } from '@/components/ui/Button';

interface InstrumentsPagerProps {
  table: Table<Instrument>;
}

export function InstrumentsPager({ table }: InstrumentsPagerProps) {
  if (table.getRowModel().rows.length === 0) return null;

  return (
    <div className="flex items-center justify-between border-t border-border-default px-4 py-3">
      <span className="text-md text-text-muted">
        Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="md"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
        >
          ‹ Prev
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          Next ›
        </Button>
      </div>
    </div>
  );
}
