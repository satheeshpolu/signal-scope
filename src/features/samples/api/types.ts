import type { SignalKind } from '@/features/signals/api/types';

/** Domain shape — one bar of OHLCV data */
export interface Sample {
  t: number; // open-time in ms
  close: number;
  volume: number;
}

/** Binance klines positional tuple */
export type KlineRaw = [
  number, // 0 openTime
  string, // 1 open
  string, // 2 high
  string, // 3 low
  string, // 4 close
  string, // 5 volume
  number, // 6 closeTime
  ...unknown[],
];

export interface SampleParams {
  symbol: string;
  signal: SignalKind;
  from: number; // ms
  to: number; // ms
}
