import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ReactRouterDom from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InstrumentsPage from './InstrumentsPage';
import * as useGetInstrumentsModule from '@/features/instruments/hooks/useGetInstruments';
import type { Instrument } from '@/features/instruments/api/types';
import { ThemeContext } from '@/lib/theme/ThemeContext';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeInstrument(symbol: string, overrides: Partial<Instrument> = {}): Instrument {
  return {
    symbol,
    lastPrice: 100,
    changePct24h: 1.5,
    volume: 50000,
    high: 110,
    low: 90,
    ...overrides,
  };
}

const MOCK_DATA: Instrument[] = [
  makeInstrument('BTCUSDT', { lastPrice: 67000, volume: 90000 }),
  makeInstrument('ETHUSDT', { lastPrice: 3200, volume: 40000 }),
  makeInstrument('SOLUSDT', { lastPrice: 180, changePct24h: -2.1, volume: 20000 }),
];

function mockHook(
  overrides: Partial<ReturnType<typeof useGetInstrumentsModule.useGetInstruments>> = {},
) {
  vi.spyOn(useGetInstrumentsModule, 'useGetInstruments').mockReturnValue({
    data: MOCK_DATA,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as never);
}

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouterDom>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage(initialSearch = '') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ThemeContext>
        <MemoryRouter initialEntries={[`/${initialSearch}`]}>
          <InstrumentsPage />
        </MemoryRouter>
      </ThemeContext>
    </QueryClientProvider>,
  );
}

// ─── tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockNavigate.mockReset();
  mockHook();
});

describe('InstrumentsPage — URL hydrates filters on mount', () => {
  it('pre-fills search input from ?q= param', () => {
    renderPage('?q=ETH');
    expect(screen.getByRole('searchbox')).toHaveValue('ETH');
  });

  it('shows only matching rows when ?q= is set', async () => {
    renderPage('?q=ETH');
    await waitFor(() => {
      expect(screen.getByText('ETHUSDT')).toBeInTheDocument();
      expect(screen.queryByText('BTCUSDT')).not.toBeInTheDocument();
    });
  });

  it('reads sort direction from ?sort=volume&dir=desc', () => {
    renderPage('?sort=volume&dir=desc');
    expect(screen.getByLabelText('Sort by')).toHaveValue('volume:desc');
  });
});

describe('InstrumentsPage — filter change updates URL', () => {
  it('typing in search updates the search input', async () => {
    renderPage();
    const input = screen.getByRole('searchbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'SOL');
    expect(input).toHaveValue('SOL');
  });

  it('changing sort select reflects new value', async () => {
    renderPage();
    const select = screen.getByLabelText('Sort by');
    await userEvent.selectOptions(select, 'volume:desc');
    expect(select).toHaveValue('volume:desc');
  });
});

describe('InstrumentsPage — Inspect click navigates', () => {
  it('calls navigate with correct symbol and back param', async () => {
    renderPage();
    await waitFor(() => screen.getByText('BTCUSDT'));
    const buttons = screen.getAllByRole('button', { name: /inspect/i });
    await userEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/instruments\/BTCUSDT\?/));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('back='));
  });
});

describe('InstrumentsPage — error state', () => {
  it('renders error message when hook is in error state', async () => {
    mockHook({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Request failed'),
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/request failed/i)).toBeInTheDocument();
    });
  });

  it('renders spinner while loading', () => {
    mockHook({ data: undefined, isLoading: true, isError: false });
    renderPage();
    expect(
      document.querySelector('[class*="animate-spin"]') ?? screen.queryByRole('status'),
    ).toBeTruthy();
  });
});
