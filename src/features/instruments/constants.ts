export const PAGE_SIZE = 5;

export const CURATED_SYMBOLS: readonly string[] = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'ADAUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'LINKUSDT',
  'MATICUSDT',
  'LTCUSDT',
  'UNIUSDT',
  'ATOMUSDT',
  'XLMUSDT',
  'VETUSDT',
  'TRXUSDT',
  'FILUSDT',
  'AAVEUSDT',
  'SHIBUSDT',
];

export const MS_24H = 24 * 60 * 60 * 1000;
export const MS_7D = 7 * MS_24H;
export const MS_30D = 30 * MS_24H;
export const MS_1Y = 365 * MS_24H;

export const PRESETS = [
  { label: '24h', ms: MS_24H },
  { label: '7d', ms: MS_7D },
  { label: '30d', ms: MS_30D },
  { label: '1y', ms: MS_1Y },
] as const;
