import { describe, it, expect } from 'vitest';
import { adaptTicker } from './service';
import type { TickerRaw } from './types';

const raw: TickerRaw = {
  symbol: 'BTCUSDT',
  lastPrice: '67432.15',
  priceChangePercent: '-1.23',
  volume: '12345.678',
  highPrice: '68000.00',
  lowPrice: '66500.00',
};

describe('adaptTicker', () => {
  it('maps symbol as-is', () => {
    expect(adaptTicker(raw).symbol).toBe('BTCUSDT');
  });

  it('parses lastPrice string to number', () => {
    expect(adaptTicker(raw).lastPrice).toBe(67432.15);
  });

  it('parses negative changePct24h', () => {
    expect(adaptTicker(raw).changePct24h).toBe(-1.23);
  });

  it('parses volume', () => {
    expect(adaptTicker(raw).volume).toBeCloseTo(12345.678);
  });
});
