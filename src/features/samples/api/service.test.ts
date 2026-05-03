import { describe, it, expect } from 'vitest';
import { adaptKline } from './service';
import type { KlineRaw } from './types';

const raw: KlineRaw = [
  1714000000000,
  '66000',
  '68000',
  '65000',
  '67432.15',
  '9876.5',
  1714003599999,
];

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
