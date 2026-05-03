import { httpClient } from '@/lib/http/HttpClient';
import type { IInstrumentsService } from '@/features/instruments/api/interface';
import type { Instrument, TickerRaw } from '@/features/instruments/api/types';
import { CURATED_SYMBOLS } from '@/features/instruments/constants';

export function adaptTicker(raw: TickerRaw): Instrument {
  return {
    symbol: raw.symbol,
    lastPrice: parseFloat(raw.lastPrice),
    changePct24h: parseFloat(raw.priceChangePercent),
    volume: parseFloat(raw.volume),
    high: parseFloat(raw.highPrice),
    low: parseFloat(raw.lowPrice),
  };
}

class HttpInstrumentsService implements IInstrumentsService {
  private static _instance: HttpInstrumentsService;

  static getInstance(): HttpInstrumentsService {
    if (!HttpInstrumentsService._instance) {
      HttpInstrumentsService._instance = new HttpInstrumentsService();
    }
    return HttpInstrumentsService._instance;
  }

  async list(): Promise<Instrument[]> {
    const raw = await httpClient.get<TickerRaw[]>('/api/v3/ticker/24hr', {
      symbols: JSON.stringify(CURATED_SYMBOLS),
    });
    return raw.map(adaptTicker);
  }
}

export const instrumentsService = HttpInstrumentsService.getInstance();
