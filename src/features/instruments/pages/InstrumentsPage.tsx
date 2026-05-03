import { useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { useGetInstruments } from '@/features/instruments/hooks/useGetInstruments';
import { type Instrument, SortField, SortDir } from '@/features/instruments/api/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { PAGE_SIZE } from '@/features/instruments/constants';

const colHelper = createColumnHelper<Instrument>();

const COLUMNS = [
  colHelper.accessor('symbol', { header: 'Symbol', enableSorting: true }),
  colHelper.accessor('lastPrice', {
    header: 'Last Price',
    cell: (info) =>
      `$${info.getValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
    enableSorting: true,
  }),
  colHelper.accessor('changePct24h', {
    header: '24h %',
    cell: (info) => {
      const v = info.getValue();
      return (
        <span className={v >= 0 ? 'text-success-500' : 'text-danger-500'}>
          {v >= 0 ? '+' : ''}
          {v.toFixed(2)}%
        </span>
      );
    },
    enableSorting: true,
  }),
  colHelper.accessor('volume', {
    header: 'Volume',
    cell: (info) => info.getValue().toLocaleString(undefined, { maximumFractionDigits: 0 }),
    enableSorting: true,
  }),
  colHelper.accessor('high', {
    header: 'High',
    cell: (info) => `$${info.getValue().toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    enableSorting: false,
  }),
  colHelper.accessor('low', {
    header: 'Low',
    cell: (info) => `$${info.getValue().toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    enableSorting: false,
  }),
];

function buildDefaultFrom(): number {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.getTime();
}

export default function InstrumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawQ = searchParams.get('q') ?? '';
  const sortField = (searchParams.get('sort') as SortField | null) ?? SortField.Symbol;
  const sortDir = (searchParams.get('dir') as SortDir | null) ?? SortDir.Asc;
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '1', 10) - 1);

  const debouncedQ = useDebounce(rawQ, 250);

  const { data, isLoading, isError, error, refetch } = useGetInstruments();

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((row) => row.symbol.toLowerCase().includes(debouncedQ.toLowerCase()));
  }, [data, debouncedQ]);

  const sorting = useMemo<SortingState>(
    () => [{ id: sortField, desc: sortDir === SortDir.Desc }],
    [sortField, sortDir],
  );

  const table = useReactTable({
    data: filtered,
    columns: COLUMNS,
    state: {
      sorting,
      pagination: { pageIndex: page, pageSize: PAGE_SIZE },
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      const [s] = next;
      if (!s) return;
      setSearchParams((p) => {
        p.set('sort', s.id);
        p.set('dir', s.desc ? SortDir.Desc : SortDir.Asc);
        p.set('page', '1');
        return p;
      });
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater({ pageIndex: page, pageSize: PAGE_SIZE }) : updater;
      setSearchParams((p) => {
        p.set('page', String(next.pageIndex + 1));
        return p;
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: false,
    manualPagination: false,
    manualFiltering: true,
    autoResetPageIndex: false,
  });

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams((p) => {
        const v = e.target.value;
        if (v) p.set('q', v);
        else p.delete('q');
        p.set('page', '1');
        return p;
      });
    },
    [setSearchParams],
  );

  const handleInspect = useCallback(
    (symbol: string) => {
      const now = Date.now();
      const from = buildDefaultFrom();
      navigate(
        `/instruments/${symbol}?signal=volume&from=${from}&to=${now}&back=${encodeURIComponent(window.location.search)}`,
      );
    },
    [navigate],
  );

  return (
    <div className="flex min-h-screen flex-col bg-surface-950">
      <Header />
      <main className="mx-auto w-full flex-1 px-6 py-6">
        {/* Controls */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search symbol…"
            value={rawQ}
            onChange={handleSearch}
            className="h-8 w-56 rounded-md border border-border-default bg-surface-800 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-400"
            aria-label="Search instruments"
          />

          <select
            value={`${sortField}:${sortDir}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split(':');
              setSearchParams((p) => {
                p.set('sort', field);
                p.set('dir', dir);
                p.set('page', '1');
                return p;
              });
            }}
            className="h-8 rounded-md border border-border-default bg-surface-800 px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
            aria-label="Sort by"
          >
            <option value="symbol:asc">Symbol A→Z</option>
            <option value="symbol:desc">Symbol Z→A</option>
            <option value="changePct24h:desc">24h % High→Low</option>
            <option value="changePct24h:asc">24h % Low→High</option>
            <option value="volume:desc">Volume High→Low</option>
          </select>

          <p className="ml-auto flex items-center gap-2 text-md text-text-muted text-right">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-primary-400 hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <polyline points="3 3 3 9 9 9" />
              </svg>
              Reset Filter(s)
            </Link>
          </p>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border-default">
          {isLoading && (
            <div className="flex justify-center py-16">
              <Spinner className="h-8 w-8 text-primary-400" />
            </div>
          )}

          {isError && (
            <ErrorState
              message={(error as { message?: string })?.message ?? 'Failed to load instruments.'}
              onRetry={() => void refetch()}
            />
          )}

          {!isLoading && !isError && (
            <>
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
                      <th className="px-6 py-3 text-left font-medium text-text-secondary">
                        [Inspect]
                      </th>
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
                            size="md"
                            onClick={() => handleInspect(row.original.symbol)}
                            className="text-gray-200 cursor-pointer"
                          >
                            Inspect →
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pager */}
              {table.getRowModel().rows.length !== 0 && (
                <div className="flex items-center justify-between border-t border-border-default px-4 py-3">
                  <span className="text-md text-text-muted">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {Math.max(1, table.getPageCount())}
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
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
