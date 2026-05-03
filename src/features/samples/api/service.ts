import { httpClient } from '@/lib/http/HttpClient';
import type { ISamplesService } from '@/features/samples/api/interface';
import type { KlineRaw, Sample, SampleParams } from '@/features/samples/api/types';

/** Picks the klines interval that fits the window within Binance's 1000-candle limit */
function intervalForRange(fromMs: number, toMs: number): string {
  const hours = (toMs - fromMs) / (1000 * 60 * 60);
  if (hours <= 24) return '5m'; // ≤ 288 candles
  if (hours <= 168) return '15m'; // ≤ 672 candles  (7 d)
  if (hours <= 720) return '1h'; // ≤ 720 candles  (30 d)
  if (hours <= 2160) return '4h'; // ≤ 540 candles  (90 d)
  return '1d'; // ≤ 365 candles  (1 y)
}

export function adaptKline(raw: KlineRaw): Sample {
  return {
    t: raw[0],
    close: parseFloat(raw[4]),
    volume: parseFloat(raw[5]),
  };
}

class HttpSamplesService implements ISamplesService {
  private static _instance: HttpSamplesService;

  static getInstance(): HttpSamplesService {
    if (!HttpSamplesService._instance) {
      HttpSamplesService._instance = new HttpSamplesService();
    }
    return HttpSamplesService._instance;
  }

  async list(params: SampleParams): Promise<Sample[]> {
    const interval = intervalForRange(params.from, params.to);
    const raw = await httpClient.get<KlineRaw[]>('/api/v3/klines', {
      symbol: params.symbol,
      interval,
      startTime: params.from,
      endTime: params.to,
      limit: 1000,
    });
    return raw.map(adaptKline);
  }
}

export const samplesService = HttpSamplesService.getInstance();
