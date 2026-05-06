import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useGetSamples } from '@/features/samples/hooks/useGetSamples';
import { useGetSignals } from '@/features/signals/hooks/useGetSignals';
import { useLabelsStore } from '@/features/labels/store/labelsStore';
import { TimeseriesChart } from '@/features/samples/components/TimeseriesChart';
import { LabelSidebar } from '@/features/labels/components/LabelSidebar';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { type SignalKind as SignalKindType, SignalKind } from '@/features/signals/api/types';
import { useTheme } from '@/lib/theme/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ChevronLeftIcon } from '@/components/icons';
import { MS_30D, PRESETS } from '@/features/instruments/constants';
import type { Label } from '@/features/labels/types';

const NOW = Date.now();

function defaultFrom() {
  return NOW - MS_30D;
}

/**
 * Given the current view range (from URL), return a wider fetch window so the
 * user can always zoom out after a reload. Picks the next larger preset that
 * contains the view duration, centered on the view midpoint.
 * Only used as a fallback when df/dt params are absent (e.g. old links).
 */
function computeFetchRange(urlFrom: number, urlTo: number): { from: number; to: number } {
  const duration = urlTo - urlFrom;
  const larger = PRESETS.find((p) => p.ms > duration);
  if (!larger) return { from: urlFrom, to: urlTo };
  // Anchor to NOW so the fetch window never extends into the future.
  const clampedTo = Math.min(urlTo, Date.now());
  return { from: clampedTo - larger.ms, to: clampedTo };
}

export default function InspectPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const signal = (searchParams.get('signal') as SignalKindType | null) ?? SignalKind.Close;
  const from = parseInt(searchParams.get('from') ?? String(defaultFrom()), 10);
  const to = parseInt(searchParams.get('to') ?? String(NOW), 10);
  const backSearch = searchParams.get('back') ?? '';

  // fetchRange drives the API call. Updated only by preset/signal changes,
  // NOT by zoom — so zooming never triggers a refetch and the chart stays smooth.
  // df/dt in the URL store the exact fetch window so reload restores the same data.
  const [fetchRange, setFetchRange] = useState(() => {
    const df = searchParams.get('df');
    const dt = searchParams.get('dt');
    if (df && dt) return { from: parseInt(df, 10), to: parseInt(dt, 10) };
    // If from/to already align with a preset (fresh nav or preset URL without zoom),
    // use them directly — no need to widen the window.
    const duration = to - from;
    const isPresetRange = PRESETS.some((p) => Math.abs(duration - p.ms) < 60_000 * 5);
    if (isPresetRange) return { from, to };
    return computeFetchRange(from, to);
  });
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focusRange, setFocusRange] = useState<{ from: number; to: number } | null>(null);

  const handleLabelFocus = useCallback(
    (label: Label) => {
      const pad = Math.round((label.to - label.from) * 0.3);
      const viewFrom = label.from - pad;
      const viewTo = label.to + pad;
      setFocusRange({ from: viewFrom, to: viewTo });
      // Update URL so the shared link opens the same centered view
      setSearchParams(
        (p) => {
          p.set('from', String(viewFrom));
          p.set('to', String(viewTo));
          // Ensure df/dt cover the view window (use existing fetch range if wider)
          const df = p.get('df');
          const dt = p.get('dt');
          if (!df || !dt || parseInt(df, 10) > viewFrom || parseInt(dt, 10) < viewTo) {
            const wider = computeFetchRange(viewFrom, viewTo);
            p.set('df', String(wider.from));
            p.set('dt', String(wider.to));
          }
          return p;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

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
    from: fetchRange.from,
    to: fetchRange.to,
  });

  const { theme } = useTheme();

  const labels = useLabelsStore((s) => s.labels);
  const { undo, redo } = useLabelsStore();

  const symbolLabels = labels.filter((l) => l.symbol === symbol);

  const [zoomResetKey, setZoomResetKey] = useState(0);
  const handleHistoryChange = useCallback(() => setZoomResetKey((k) => k + 1), []);

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
      handleHistoryChange();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [undo, redo, handleHistoryChange]);

  const setPreset = useCallback(
    (ms: number) => {
      const t = Date.now();
      const newFrom = t - ms;
      const newTo = t;
      setFetchRange({ from: newFrom, to: newTo });
      setSearchParams((p) => {
        p.set('from', String(newFrom));
        p.set('to', String(newTo));
        // Store the fetch range so reload restores the exact same window
        p.set('df', String(newFrom));
        p.set('dt', String(newTo));
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
      if (zTo - zFrom < 60_000) return;
      // Clear any active label focus so stale focusRange can't re-zoom the chart
      // when samples change (e.g. preset switch triggers a refetch).
      setFocusRange(null);
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
      zoomTimerRef.current = setTimeout(() => {
        setSearchParams(
          (p) => {
            p.set('from', String(Math.round(zFrom)));
            p.set('to', String(Math.round(zTo)));
            // Always ensure df/dt exist so shared URLs have a self-contained fetch window.
            // If a preset already set them, leave them unchanged (they cover a wider range).
            // If missing (fresh load with no preset click), compute a wider window from the
            // zoomed range so user 2 fetches the correct historical data.
            if (!p.has('df') || !p.has('dt')) {
              const wider = computeFetchRange(zFrom, zTo);
              p.set('df', String(wider.from));
              p.set('dt', String(wider.to));
            }
            return p;
          },
          { replace: true },
        );
      }, 200);
    },
    [setSearchParams, setFocusRange],
  );

  // Clear pending zoom timer on unmount to avoid stale URL updates
  useEffect(
    () => () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    },
    [],
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
            const active = Math.abs(fetchRange.to - fetchRange.from - p.ms) < 60_000 * 5;
            return (
              <Button
                key={p.label}
                variant={active ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPreset(p.ms)}
                className="cursor-pointer"
                aria-pressed={active}
              >
                {p.label}
              </Button>
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
        <main className="flex min-w-0 flex-1 flex-col p-16">
          {isLoading && (
            <div className="flex items-center justify-center">
              <Spinner className="h-10 w-10 text-primary-400" />
            </div>
          )}

          {isError && (
            <div className="flex  items-center justify-center">
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
              viewFrom={from}
              viewTo={to}
              focusRange={focusRange}
              zoomResetKey={zoomResetKey}
              onZoom={handleZoom}
            />
          )}
        </main>

        {/* Label sidebar */}
        <LabelSidebar
          symbol={symbol}
          onLabelFocus={handleLabelFocus}
          onHistoryChange={handleHistoryChange}
        />
      </div>
    </div>
  );
}
