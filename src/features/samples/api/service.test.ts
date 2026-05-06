import { describe, it, expect } from 'vitest';
import { adaptKline } from './service';
import { lttb } from '@/features/samples/utils';
import type { KlineRaw, Sample } from './types';

const raw: KlineRaw = [
  1714000000000,
  '66000',
  '68000',
  '65000',
  '67432.15',
  '9876.5',
  1714003599999,
];

function makeSamples(count: number): Sample[] {
  return Array.from({ length: count }, (_, i) => ({
    t: i * 60_000,
    close: 100 + i,
    volume: 1000 + i,
  }));
}

describe('lttb', () => {
  it('returns data as-is when length <= threshold', () => {
    const data = makeSamples(10);
    expect(lttb(data, 10, 'close')).toBe(data);
    expect(lttb(data, 50, 'close')).toBe(data);
  });

  it('reduces to exactly threshold points', () => {
    expect(lttb(makeSamples(5_000), 100, 'close')).toHaveLength(100);
  });

  it('always preserves first and last points', () => {
    const data = makeSamples(5_000);
    const result = lttb(data, 100, 'close');
    expect(result[0]).toBe(data[0]);
    expect(result[result.length - 1]).toBe(data[data.length - 1]);
  });

  it('output timestamps are monotonically increasing', () => {
    const result = lttb(makeSamples(5_000), 100, 'close');
    for (let i = 1; i < result.length; i++) {
      expect(result[i].t).toBeGreaterThan(result[i - 1].t);
    }
  });
});

describe('adaptKline', () => {
  it('maps openTime to t', () => {
    expect(adaptKline(raw).t).toBe(1714000000000);
  });

  it('parses close from index 4', () => {
    expect(adaptKline(raw).close).toBe(67432.15);
  });

  it('parses volume from index 5', () => {
    expect(adaptKline(raw).volume).toBeCloseTo(9876.5);
  });
});
