import { useCallback, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useGetSamples } from '@/features/samples/hooks/useGetSamples';
import { useGetSignals } from '@/features/signals/hooks/useGetSignals';
import { useLabelsStore } from '@/features/labels/store/labelsStore';
import { TimeseriesChart } from '@/features/samples/components/TimeseriesChart';
import { LabelSidebar } from '@/features/labels/components/LabelSidebar';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { type SignalKind as SignalKindType, SignalKind } from '@/features/signals/api/types';
import { useTheme } from '@/lib/theme/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ChevronLeftIcon } from '@/components/icons';
import { MS_30D, PRESETS } from '@/features/instruments/constants';

const NOW = Date.now();

function defaultFrom() {
  return NOW - MS_30D;
}

export default function InspectPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  // Todo Back with history
  const signal = (searchParams.get('signal') as SignalKindType | null) ?? SignalKind.Close;
  const from = parseInt(searchParams.get('from') ?? String(defaultFrom()), 10);
  const to = parseInt(searchParams.get('to') ?? String(NOW), 10);
  const backSearch = searchParams.get('back') ?? '';

  const { data: signals } = useGetSignals();
  const {
    data: samples,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSamples({
    symbol: symbol ?? '',
    signal,
    from,
    to,
  });

  const { theme } = useTheme();

  const labels = useLabelsStore((s) => s.labels);
  const { undo, redo } = useLabelsStore();

  const symbolLabels = labels.filter((l) => l.symbol === symbol);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((!e.ctrlKey && !e.metaKey) || e.code !== 'KeyZ') return;
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const setPreset = useCallback(
    (ms: number) => {
      const t = Date.now();
      setSearchParams((p) => {
        p.set('from', String(t - ms));
        p.set('to', String(t));
        return p;
      });
    },
    [setSearchParams],
  );

  const handleSignalChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSearchParams((p) => {
        p.set('signal', e.target.value);
        return p;
      });
    },
    [setSearchParams],
  );

  const handleZoom = useCallback(
    (zFrom: number, zTo: number) => {
      setSearchParams(
        (p) => {
          p.set('from', String(Math.round(zFrom)));
          p.set('to', String(Math.round(zTo)));
          return p;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const backHref = `/${backSearch}`;

  if (!symbol) return null;

  return (
    <div className="flex h-screen flex-col bg-surface-950">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-3 border-b border-border-default bg-surface-900 px-6 py-3">
        <h1 className="text-base font-semibold text-text-primary text-lg ">{symbol}</h1>

        {/* Signal selector */}
        <select
          value={signal}
          onChange={handleSignalChange}
          className="h-8 rounded-md border border-border-default bg-surface-800 px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
          aria-label="Signal"
        >
          {(
            signals ?? [
              { id: SignalKind.Volume, label: 'Volume' },
              { id: SignalKind.Close, label: 'Close Price' },
            ]
          ).map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Date-range presets */}
        <div className="flex gap-1" role="group" aria-label="Date range preset">
          {PRESETS.map((p) => {
            const active = Math.abs(to - from - p.ms) < 60_000 * 5;
            return (
              <button
                key={p.label}
                onClick={() => setPreset(p.ms)}
                className={[
                  'h-7 rounded px-2.5 text-md font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 cursor-pointer text-gray-200',
                  active
                    ? 'bg-primary-600'
                    : 'bg-surface-700 text-text-secondary hover:bg-surface-600',
                ].join(' ')}
                aria-pressed={active}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <Link
            to={backHref}
            className="flex items-center gap-1 rounded border border-border-default px-2.5 py-1 text-md text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-800 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            aria-label="Back to instruments list"
          >
            <ChevronLeftIcon /> Back
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Chart area */}
        <main className="flex min-w-0 flex-1 flex-col p-4">
          {isLoading && (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="h-10 w-10 text-primary-400" />
            </div>
          )}

          {isError && (
            <div className="flex flex-1 items-center justify-center">
              <ErrorState
                message={(error as { message?: string })?.message ?? 'Failed to load chart data.'}
                onRetry={() => void refetch()}
              />
            </div>
          )}

          {!isLoading && !isError && (
            <TimeseriesChart
              samples={samples ?? []}
              labels={symbolLabels}
              signal={signal}
              symbol={symbol}
              theme={theme}
              onZoom={handleZoom}
            />
          )}
        </main>

        {/* Label sidebar */}
        <LabelSidebar symbol={symbol} />
      </div>
    </div>
  );
}
