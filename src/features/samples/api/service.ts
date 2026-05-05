import { httpClient } from '@/lib/http/HttpClient';
import type { ISamplesService } from '@/features/samples/api/interface';
import type { KlineRaw, Sample, SampleParams } from '@/features/samples/api/types';
import { lttb } from '@/features/samples/utils';

const MAX_CHART_POINTS = 1_000;

/** Picks the klines interval that fits the window within Binance's 1000-candle limit */
function intervalForRange(fromMs: number, toMs: number): string {
  const hours = (toMs - fromMs) / (1000 * 60 * 60);
  if (hours <= 24) return '1m';
  if (hours <= 168) return '15m';
  if (hours <= 720) return '1h';
  if (hours <= 2160) return '4h';
  return '1d';
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
    return lttb(raw.map(adaptKline), MAX_CHART_POINTS, params.signal);
  }
}

export const samplesService = HttpSamplesService.getInstance();
