/** Domain shape — numeric fields, not raw Binance strings */
export interface Instrument {
  symbol: string;
  lastPrice: number;
  changePct24h: number;
  volume: number;
  high: number;
  low: number;
}

/** Raw Binance /ticker/24hr response — numeric fields arrive as strings */
export interface TickerRaw {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
}

export const SortField = {
  Symbol: 'symbol',
  ChangePct24h: 'changePct24h',
  Volume: 'volume',
} as const;
export type SortField = (typeof SortField)[keyof typeof SortField];

export const SortDir = {
  Asc: 'asc',
  Desc: 'desc',
} as const;
export type SortDir = (typeof SortDir)[keyof typeof SortDir];

export interface InstrumentFilters {
  q: string;
  sort: SortField;
  dir: SortDir;
}
